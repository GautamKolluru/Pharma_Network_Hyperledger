#!/bin/bash

# imports
. scripts/envVarUpdated.sh
. scripts/utils.sh

CHANNEL_NAME="$1"
DELAY="$2"
MAX_RETRY="$3"
VERBOSE="$4"
: ${CHANNEL_NAME:="mychannel"}
: ${DELAY:="3"}
: ${MAX_RETRY:="5"}
: ${VERBOSE:="false"}

if [ ! -d "channel-artifacts" ]; then
	mkdir channel-artifacts
fi

createChannelTx() {
	set -x
	configtxgen -profile UpstacChannel -outputCreateChannelTx ./channel-artifacts/${CHANNEL_NAME}.tx -channelID $CHANNEL_NAME
	res=$?
	{ set +x; } 2>/dev/null
  verifyResult $res "Failed to generate channel configuration transaction..."
}

createChannel() {
	setGlobals "manufacturer"
	# Poll in case the raft leader is not set yet
	local rc=1
	local COUNTER=1
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
		sleep $DELAY
		set -x
		peer channel create -o localhost:7050 -c $CHANNEL_NAME --ordererTLSHostnameOverride orderer.pharma-network.com -f ./channel-artifacts/${CHANNEL_NAME}.tx --outputBlock $BLOCKFILE --tls --cafile $ORDERER_CA >&log.txt
		res=$?
		{ set +x; } 2>/dev/null
		let rc=$res
		COUNTER=$(expr $COUNTER + 1)
	done
	cat log.txt
	verifyResult $res "Channel creation failed"
}

# joinChannel ORG
joinChannel() {
  FABRIC_CFG_PATH=$PWD/../config/
  ORG=$1
  setGlobals $ORG
	local rc=1
	local COUNTER=1
	## Sometimes Join takes time, hence retry
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
    sleep $DELAY
    set -x
    peer channel join -b $BLOCKFILE >&log.txt
    res=$?
    { set +x; } 2>/dev/null
		let rc=$res
		COUNTER=$(expr $COUNTER + 1)
	done
	cat log.txt
	verifyResult $res "After $MAX_RETRY attempts, peer0.${ORG} has failed to join channel '$CHANNEL_NAME' "
}

setAnchorPeer() {
	infoln "Inside anchor peer set "
  ORG=$1
  infoln $ORG
  docker exec cli ./scripts/setAnchorPeer.sh $ORG $CHANNEL_NAME
}

FABRIC_CFG_PATH=${PWD}/configtx

## Create channeltx
infoln "Generating channel create transaction '${CHANNEL_NAME}.tx'"
createChannelTx

FABRIC_CFG_PATH=$PWD/../config/
BLOCKFILE="./channel-artifacts/${CHANNEL_NAME}.block"

## Create channel
infoln "Creating channel ${CHANNEL_NAME}"
createChannel
successln "Channel '$CHANNEL_NAME' created"

## Join all the peers to the channel
infoln "Joining manufacturer peer0 to the channel..."
joinChannel "manufacturer"
infoln "Joining distributor peer0 to the channel..."
joinChannel "distributor"
infoln "Joining retailer peer0 to the channel..."
joinChannel "retailer"
infoln "Joining transporter peer0 to the channel..."
joinChannel "transporter"
infoln "Joining consumer peer0 to the channel..."
joinChannel "consumer"

infoln "Joining manufacturer peer1 to the channel..."
joinChannel "manufacturerpeer1"
infoln "Joining distributor peer1 to the channel..."
joinChannel "distributorpeer1"
infoln "Joining retailer peer1 to the channel..."
joinChannel "retailerpeer1"
infoln "Joining transporter peer1 to the channel..."
joinChannel "transporterpeer1"
infoln "Joining consumer peer1 to the channel..."
joinChannel "consumerpeer1"


## Set the anchor peers for each org in the channel
infoln "Setting anchor peer for manufacturer..."
setAnchorPeer "manufacturer"
infoln "Setting anchor peer for distributor..."
setAnchorPeer "distributor"
infoln "Setting anchor peer for retailer..."
setAnchorPeer "retailer"
infoln "Setting anchor peer for transporter..."
setAnchorPeer "transporter"
infoln "Setting anchor peer for consumer..."
setAnchorPeer "consumer"

successln "Channel '$CHANNEL_NAME' joined"
