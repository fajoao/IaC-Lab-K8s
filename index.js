"use strict";

const pulumi = require("@pulumi/pulumi");
const azure_native = require("@pulumi/azure-native");

const rgName = "lab-k8s-rg";
const location = "eastus2";

const createResourceGroup = () => {
  return new azure_native.resources.ResourceGroup("resourceGroup", {
    location: location,
    resourceGroupName: rgName,
  });
};

const createVirtualNetwork = (resourceGroup) => {
  return new azure_native.network.VirtualNetwork("virtualNetwork", {
    addressSpace: {
      addressPrefixes: ["10.0.0.0/16"],
    },
    location: location,
    resourceGroupName: rgName,
    virtualNetworkName: "vnetk8s",
  }, { dependsOn: [resourceGroup] });
};

const createSubnet = (virtualNetwork) => {
  return new azure_native.network.Subnet("subnetDefault", {
    subnetName: "default",
    location: location,
    resourceGroupName: rgName,
    virtualNetworkName: "vnetk8s",
    addressPrefix: "10.0.0.0/24",
  }, { dependsOn: [virtualNetwork] });
};

const createPublicIPAddress = (name) => {
  return new azure_native.network.PublicIPAddress(`pip-${name}`, {
    name: `pip-${name}`,
    publicIPAllocationMethod: "Static",
    publicIPAddressVersion: "IPv4",
    location: location,
    publicIpAddressName: `pip-${name}`,
    resourceGroupName: rgName,
  });
};

const createNetworkInterface = (name, publicIPAddress, subnetDefault) => {
  return new azure_native.network.NetworkInterface(`nic-${name}-001`, {
    name: `nic-${name}-001`,
    enableAcceleratedNetworking: false,
    ipConfigurations: [{
      name: "ipconfig1",
      publicIPAddress: {
        id: publicIPAddress.id,
      },
      subnet: {
        id: subnetDefault.id,
      },
    }],
    location: location,
    networkInterfaceName: `nic-${name}-001`,
    resourceGroupName: rgName,
  }, { dependsOn: [subnetDefault] });
};

const createVirtualMachine = (name, networkInterface) => {
  return new azure_native.compute.VirtualMachine(name, {
    name: name,
    vmName: name,
    resourceGroupName: rgName,
    location: location,
    hardwareProfile: {
      vmSize: "standard_b2s",
    },
    networkProfile: {
      networkInterfaces: [{
        id: networkInterface.id,
        primary: true,
      }],
    },
    osProfile: {
      adminPassword: "SenhaDasVMs",
      adminUsername: "SeuUsuário",
      computerName: name,
      linuxConfiguration: {
        patchSettings: {
          assessmentMode: "ImageDefault",
        },
        provisionVMAgent: true,
      },
    },
    storageProfile: {
      imageReference: {
        offer: "0001-com-ubuntu-server-focal",
        publisher: "Canonical",
        sku: "20_04-lts",
        version: "latest",
      },
      osDisk: {
        caching: "ReadOnly",
        createOption: "FromImage",
        diskSizeGB: 127,
        managedDisk: {
          storageAccountType: "StandardSSD_LRS",
        },
        name: `disk-os-${name}`,
      },
    },
  });
};

const createKubernetesMasters = (subnetDefault, resourceGroup) => {
  const masters = [];
  for (let i = 1; i <= 3; i++) {
    const name = `k8s-master-0${i}`;
    const publicIPAddress = createPublicIPAddress(name);
    const networkInterface = createNetworkInterface(name, publicIPAddress, subnetDefault);
    const virtualMachine = createVirtualMachine(name, networkInterface);
    masters.push(virtualMachine);
  }
  return masters;
};

const createKubernetesWorkers = (subnetDefault, resourceGroup) => {
  const workers = [];
  for (let i = 1; i <= 3; i++) {
    const name = `k8s-worker-0${i}`;
    const publicIPAddress = createPublicIPAddress(name);
    const networkInterface = createNetworkInterface(name, publicIPAddress, subnetDefault);
    const virtualMachine = createVirtualMachine(name, networkInterface);
    workers.push(virtualMachine);
  }
  return workers;
};

const createLoadBalancer = (subnetDefault, resourceGroup) => {
  const loadBalancers = [];
  for (let i = 1; i <= 1; i++) {
    const name = `k8s-haproxy-0${i}`;
    const publicIPAddress = createPublicIPAddress(name);
    const networkInterface = createNetworkInterface(name, publicIPAddress, subnetDefault);
    const virtualMachine = createVirtualMachine(name, networkInterface);
    loadBalancers.push(virtualMachine);
  }
  return loadBalancers;
};

const resourceGroup = createResourceGroup();
const virtualNetwork = createVirtualNetwork(resourceGroup);
const subnetDefault = createSubnet(virtualNetwork);

const kubernetesMasters = createKubernetesMasters(subnetDefault, resourceGroup);
const kubernetesWorkers = createKubernetesWorkers(subnetDefault, resourceGroup);
const loadBalancers = createLoadBalancer(subnetDefault, resourceGroup);

module.exports = {
  resourceGroup,
  virtualNetwork,
  subnetDefault,
  kubernetesMasters,
  kubernetesWorkers,
  loadBalancers,
};
