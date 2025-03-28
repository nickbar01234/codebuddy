export interface Room {
  questionId: string;
  usernames: string[];
}

export interface PeerConnection {
  username?: string;

  offer?: RTCSessionDescriptionInit;
  offerCandidates: RTCIceCandidate[];

  answer?: RTCSessionDescriptionInit;
  answerCandidates: RTCIceCandidate[];
}

export {};
