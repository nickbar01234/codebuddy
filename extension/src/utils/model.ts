import { Peer } from "@cb/types";

export const codeViewable = (peer: Peer | undefined) => peer?.viewable ?? false;
