class Peer {
    constructor(server) {
        this.peer = new RTCPeerConnection(server);
    }

    addPeerTrack(track, localStream) {
        this.peer.addTrack(track, localStream);
    }

    async setLcDescription() {
        const offerDesc = await this.peer.createOffer();
        await this.peer.setLocalDescription(offerDesc);
        return offerDesc;
    }

    async setRmDescription(desc) {
        await this.peer.setRemoteDescription(new RTCSessionDescription(desc));
    }

    async setAnswer() {
        const answerDesc = await this.peer.createAnswer();
        await this.peer.setLocalDescription(answerDesc);
        return answerDesc;
    }

    async addIceCandidate(candidate) {
        await this.peer.addIceCandidate(candidate);
    }

    onIceCandidate(callback) {
        this.peer.onicecandidate = (event) => {
            if (event.candidate) {
                callback(event.candidate);
            }
        };
    }

    onTrack(callback) {
        this.peer.ontrack = (event) => {
            callback(event.streams[0]);
        };
    }

    close() {
        this.peer.close();
    }

    getLocalDescription() {
        return this.peer.localDescription;
    }

    getRemoteDescription() {
        return this.peer.remoteDescription;
    }

    getIceConnectionState() {
        return this.peer.iceConnectionState;
    }

    getIceGatheringState() {
        return this.peer.iceGatheringState;
    }

    getSignalingState() {
        return this.peer.signalingState;
    }

    getConnectionState() {
        return this.peer.connectionState;
    }

    getTransceiver() {
        return this.peer.getTransceivers();
    }

    getSenders() {
        return this.peer.getSenders();
    }
}

export default Peer;