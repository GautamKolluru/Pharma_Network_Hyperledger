#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

# This is a collection of bash functions used by different scripts

# imports
. scripts/utils.sh

export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/pharma-network.com/orderers/orderer.pharma-network.com/msp/tlscacerts/tlsca.pharma-network.com-cert.pem
export PEER0_MANUFACTURER_CA=${PWD}/organizations/peerOrganizations/manufacturer.pharma-network.com/peers/peer0.manufacturer.pharma-network.com/tls/ca.crt
export PEER0_DISTRIBUTOR_CA=${PWD}/organizations/peerOrganizations/distributor.pharma-network.com/peers/peer0.distributor.pharma-network.com/tls/ca.crt
export PEER0_RETAILER_CA=${PWD}/organizations/peerOrganizations/retailer.pharma-network.com/peers/peer0.retailer.pharma-network.com/tls/ca.crt
export PEER0_TRANSPORTER_CA=${PWD}/organizations/peerOrganizations/transporter.pharma-network.com/peers/peer0.transporter.pharma-network.com/tls/ca.crt
export PEER0_CONSUMER_CA=${PWD}/organizations/peerOrganizations/consumer.pharma-network.com/peers/peer0.consumer.pharma-network.com/tls/ca.crt
export PEER0_ORG3_CA=${PWD}/organizations/peerOrganizations/org3.upstac.com/peers/peer0.org3.upstac.com/tls/ca.crt

# Set environment variables for the peer org
setGlobals() {
  infoln "Under setGlobals"
  local USING_ORG=""
  if [ -z "$OVERRIDE_ORG" ]; then
    USING_ORG=$1
  else
    USING_ORG="${OVERRIDE_ORG}"
  fi
  infoln "Using organization ${USING_ORG}"
  if [ $USING_ORG == "manufacturer" ]; then
    export CORE_PEER_LOCALMSPID="ManufacturerMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_MANUFACTURER_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/manufacturer.pharma-network.com/users/Admin@manufacturer.pharma-network.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
  elif [ $USING_ORG == "distributor" ]; then
    export CORE_PEER_LOCALMSPID="DistributorMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_DISTRIBUTOR_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/distributor.pharma-network.com/users/Admin@distributor.pharma-network.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
  elif [ $USING_ORG == "retailer" ]; then
    export CORE_PEER_LOCALMSPID="RetailerMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_RETAILER_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/retailer.pharma-network.com/users/Admin@retailer.pharma-network.com/msp
    export CORE_PEER_ADDRESS=localhost:11051

  elif [ $USING_ORG == "transporter" ]; then
    export CORE_PEER_LOCALMSPID="TransporterMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_TRANSPORTER_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/transporter.pharma-network.com/users/Admin@transporter.pharma-network.com/msp
    export CORE_PEER_ADDRESS=localhost:12051

  elif [ $USING_ORG == "consumer" ]; then
    export CORE_PEER_LOCALMSPID="ConsumerMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_CONSUMER_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/consumer.pharma-network.com/users/Admin@consumer.pharma-network.com/msp
    export CORE_PEER_ADDRESS=localhost:20051

  elif [ $USING_ORG -eq 3 ]; then
    export CORE_PEER_LOCALMSPID="Org3MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG3_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org3.upstac.com/users/Admin@org3.upstac.com/msp
    export CORE_PEER_ADDRESS=localhost:13051
  else
    errorln "ORG Unknown"
  fi

  if [ "$VERBOSE" == "true" ]; then
    env | grep CORE
  fi
}

# Set environment variables for use in the CLI container
setGlobalsCLI() {
  infoln "Under setGlobalsCLI"
  infoln $1
  setGlobals $1

  local USING_ORG=""
  if [ -z "$OVERRIDE_ORG" ]; then
    USING_ORG=$1
  else
    USING_ORG="${OVERRIDE_ORG}"
  fi
  if [ $USING_ORG == "manufacturer" ]; then
    export CORE_PEER_ADDRESS=peer0.manufacturer.pharma-network.com:7051
  elif [ $USING_ORG == "distributor" ]; then
    export CORE_PEER_ADDRESS=peer0.distributor.pharma-network.com:9051
  elif [ $USING_ORG == "retailer" ]; then
    export CORE_PEER_ADDRESS=peer0.retailer.pharma-network.com:11051
  elif [ $USING_ORG == "transporter" ]; then
    export CORE_PEER_ADDRESS=peer0.transporter.pharma-network.com:12051 
  elif [ $USING_ORG == "consumer" ]; then
    export CORE_PEER_ADDRESS=peer0.consumer.pharma-network.com:20051   
  elif [ $USING_ORG -eq 3 ]; then
    export CORE_PEER_ADDRESS=peer0.org3.upstac.com:13051
  else
    errorln "ORG Unknown"
  fi
}

# parsePeerConnectionParameters $@
# Helper function that sets the peer connection parameters for a chaincode
# operation
parsePeerConnectionParameters() {
  PEER_CONN_PARMS=""
  PEERS=""
  while [ "$#" -gt 0 ]; do
    setGlobals $1
    PEER="peer0.$1"
    ## Set peer addresses
    PEERS="$PEERS $PEER"
    PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses $CORE_PEER_ADDRESS"
    ## Set path to TLS certificate
    if [ $1 == "manufacturer" ]; then
      TLSINFO=$(eval echo "--tlsRootCertFiles \$PEER0_MANUFACTURER_CA")
    elif [ $1 == "retailer" ]; then
      TLSINFO=$(eval echo "--tlsRootCertFiles \$PEER0_RETAILER_CA")
    elif [ $1 == "transporter" ]; then
      TLSINFO=$(eval echo "--tlsRootCertFiles \$PEER0_TRANSPORTER_CA")
    elif [ $1 == "distributor" ]; then
      TLSINFO=$(eval echo "--tlsRootCertFiles \$PEER0_DISTRIBUTOR_CA")
    elif [ $1 == "consumer" ]; then
      TLSINFO=$(eval echo "--tlsRootCertFiles \$PEER0_CONSUMER_CA")     
    else
      TLSINFO=$(eval echo "--tlsRootCertFiles \$PEER0_$1_CA")
    fi
    PEER_CONN_PARMS="$PEER_CONN_PARMS $TLSINFO"
    # shift by one to get to the next organization
    shift
  done
  # remove leading space for output
  PEERS="$(echo -e "$PEERS" | sed -e 's/^[[:space:]]*//')"
}

verifyResult() {
  if [ $1 -ne 0 ]; then
    fatalln "$2"
  fi
}
