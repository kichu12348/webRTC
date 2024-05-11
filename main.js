import Peer from './js/peer.js';
import io from 'socket.io-client';
import './style.css';

const socket = io('192.168.1.41:8080');

const server = {
    iceServers: [
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
            ]
        }
    ],
    iceCandidatePoolSize: 10,
};

const peer = new Peer(server);

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');
const inputId = document.querySelector('.roomIdinp');
const localStream = new MediaStream();
const remoteStream = new MediaStream();

startButton.onclick = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach(track => {
            localStream.addTrack(track);
        });
        localVideo.srcObject = localStream;
    } catch (e) {
        inputId.value = 'Error: ' + e;
        socket.emit('error', e);
    }
};

callButton.onclick = async () => {
    const roomID = inputId.value;
    socket.emit('joinRoom', { roomID, username: 'user' }); // Emit joinRoom event
    try {
        const offerDesc = await peer.setLcDescription();
        const offer = {
            offer: offerDesc,
            to: remoteStream.id
        };
        socket.emit('calling', offer);
    } catch (e) {
        console.error(e);
    }
};

hangupButton.onclick = () => {
    peer.close();
};

peer.onTrack((stream) => {
    remoteStream.addTrack(stream.getTracks()[0]);
    remoteVideo.srcObject = remoteStream;
});

peer.onIceCandidate((candidate) => {
    socket.emit('candidate', candidate);
});

socket.on('calling', async ({ offer, to }) => {
    try {
        await peer.setRmDescription(offer);
        const answerDesc = await peer.setAnswer();
        const answer = {
            answer: answerDesc,
            to
        };
        socket.emit('answer', answer);
    } catch (e) {
        console.error(e);
    }
});

socket.on('answer', async ({ answer, to }) => {
    try {
        await peer.setRmDescription(answer);
    } catch (e) {
        console.error(e);
    }
});

socket.on('candidate', async (candidate) => {
    try {
        await peer.addIceCandidate(candidate);
    } catch (e) {
        console.error(e);
    }
});

socket.on('roomUser', ({ username, bool, socketID }) => {
    if (bool) {
        const offerDesc = peer.getLocalDescription();
        const offer = {
            offer: offerDesc,
            to: socketID
        };
        socket.emit('calling', offer);
    }
});

socket.on('disconnect', () => {
    peer.close();
});