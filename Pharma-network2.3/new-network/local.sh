export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=/Users/gautamkolluru/hyper-ledger-2.4/fabric-samples/test-network/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem
export PEER0_MANUFACTURER_CA=/Users/gautamkolluru/vcscode/Pharma-network/new-network/organizations/peerOrganizations/manufacturer.pharma-network.com/tlsca/tlsca.manufacturer.pharma-network.com-cert.pem
export PEER0_DISTRIBUTOR_CA=/Users/gautamkolluru/vcscode/Pharma-network/new-network/organizations/peerOrganizations/distributor.pharma-network.com/tlsca/tlsca.distributor.pharma-network.com-cert.pem
export PEER0_RETAILER_CA=/Users/gautamkolluru/vcscode/Pharma-network/new-network/organizations/peerOrganizations/retailer.pharma-network.com/tlsca/tlsca.retailer.pharma-network.com-cert.pem
export  PEER0_TRANSPORTER_CA=/Users/gautamkolluru/vcscode/Pharma-network/new-network/organizations/peerOrganizations/transporter.pharma-network.com/tlsca/tlsca.transporter.pharma-network.com-cert.pem
export  PEER0_CONSUMER_CA=/Users/gautamkolluru/vcscode/Pharma-network/new-network/organizations/peerOrganizations/consumer.pharma-network.com/tlsca/tlsca.consumer.pharma-network.com-cert.pem

export CORE_PEER_MSPCONFIGPATH=/Users/gautamkolluru/vcscode/Pharma-network/new-network/organizations/peerOrganizations/manufacturer.pharma-network.com/users/Admin@manufacturer.pharma-network.com/msp
export CORE_PEER_ADDRESS=localhost:7051
export CORE_PEER_TLS_ROOTCERT_FILE=/Users/gautamkolluru/vcscode/Pharma-network/new-network/organizations/peerOrganizations/manufacturer.pharma-network.com/tlsca/tlsca.manufacturer.pharma-network.com-cert.pem
export CORE_PEER_LOCALMSPID=ManufacturerMSP
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/


Distributor
export CORE_PEER_MSPCONFIGPATH=/Users/gautamkolluru/vcscode/Pharma-network/new-network/organizations/peerOrganizations/distributor.pharma-network.com/users/Admin@distributor.pharma-network.com/msp
export CORE_PEER_ADDRESS=localhost:9051
export CORE_PEER_TLS_ROOTCERT_FILE=/Users/gautamkolluru/vcscode/Pharma-network/new-network/organizations/peerOrganizations/distributor.pharma-network.com/tlsca/tlsca.distributor.pharma-network.com-cert.pem
export CORE_PEER_LOCALMSPID=DistributorMSP

Transporter

export CORE_PEER_MSPCONFIGPATH=/Users/gautamkolluru/vcscode/Pharma-network/new-network/organizations/peerOrganizations/transporter.pharma-network.com/users/Admin@transporter.pharma-network.com/msp
export CORE_PEER_ADDRESS=localhost:9447
export CORE_PEER_TLS_ROOTCERT_FILE=/Users/gautamkolluru/vcscode/Pharma-network/new-network/organizations/peerOrganizations/transporter.pharma-network.com/tlsca/tlsca.transporter.pharma-network.com-cert.pem
export CORE_PEER_LOCALMSPID=TransporterMSP

Retailer

export CORE_PEER_MSPCONFIGPATH=/Users/gautamkolluru/vcscode/Pharma-network/new-network/organizations/peerOrganizations/retailer.pharma-network.com/users/Admin@retailer.pharma-network.com/msp
export CORE_PEER_ADDRESS=localhost:9446
export CORE_PEER_TLS_ROOTCERT_FILE=/Users/gautamkolluru/vcscode/Pharma-network/new-network/organizations/peerOrganizations/retailer.pharma-network.com/tlsca/tlsca.retailer.pharma-network.com-cert.pem
export CORE_PEER_LOCALMSPID=RetailerMSP

