"use strict";
const pulumi = require("@pulumi/pulumi");
const azure_native = require("@pulumi/azure-native");
const rgName = `lab-k8s-rg`;
const location = "eastus2"
const resourceGroup = new azure_native.resources.ResourceGroup("resourceGroup", {
    location: location,
    resourceGroupName: rgName,
});
const virtualNetwork = new azure_native.network.VirtualNetwork("virtualNetwork", {
    addressSpace: {
        addressPrefixes: ["10.0.0.0/16"],
    },
    location: location,
    resourceGroupName: rgName,
    virtualNetworkName: "vnetk8s",
}, { dependsOn: resourceGroup });
const subnetDefault = new azure_native.network.Subnet("subnetDefault", {
    subnetName: "default",
    location: location,
    resourceGroupName: rgName,
    virtualNetworkName: "vnetk8s",
    addressPrefix: "10.0.0.0/24",
}, { dependsOn: virtualNetwork });
for (var i = 1; i <= 3; i++) {
const name = `k8s-master-0${i}`
const publicIPAddress = new azure_native.network.PublicIPAddress(`pip-${name}`, {
    name: `pip-${name}`,
    publicIPAllocationMethod: "Static",
    publicIPAddressVersion: "IPv4",
    location: location,
    publicIpAddressName: `pip-${name}`,
    resourceGroupName: rgName,
}, { dependsOn: resourceGroup });
const networkInterface = new azure_native.network.NetworkInterface(`nic-${name}-001`, {
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
}, { dependsOn: subnetDefault });
const virtualMachine = new azure_native.compute.VirtualMachine(name, {
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
        adminPassword: "K8sLab@1983",
        adminUsername: "fabiosilva",
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
}
for (var i = 1; i <= 3; i++) {
    const name = `k8s-worker-0${i}`
    const publicIPAddress = new azure_native.network.PublicIPAddress(`pip-${name}`, {
        name: `pip-${name}`,
        publicIPAllocationMethod: "Static",
        publicIPAddressVersion: "IPv4",
        location: location,
        publicIpAddressName: `pip-${name}`,
        resourceGroupName: rgName,
    }, { dependsOn: resourceGroup });
    const networkInterface = new azure_native.network.NetworkInterface(`nic-${name}-001`, {
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
    }, { dependsOn: subnetDefault });
    const virtualMachine = new azure_native.compute.VirtualMachine(name, {
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
            adminPassword: "K8sLab@1983",
            adminUsername: "fabiosilva",
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
    }
    for (var i = 1; i <= 1; i++) {
        const name = `k8s-haproxy-0${i}`
        const publicIPAddress = new azure_native.network.PublicIPAddress(`pip-${name}`, {
            name: `pip-${name}`,
            publicIPAllocationMethod: "Static",
            publicIPAddressVersion: "IPv4",
            location: location,
            publicIpAddressName: `pip-${name}`,
            resourceGroupName: rgName,
        }, { dependsOn: resourceGroup });
        const networkInterface = new azure_native.network.NetworkInterface(`nic-${name}-001`, {
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
        }, { dependsOn: subnetDefault });
        const virtualMachine = new azure_native.compute.VirtualMachine(name, {
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
                adminPassword: "K8sLab@1983",
                adminUsername: "fabiosilva",
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
}