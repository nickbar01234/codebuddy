import { EventEmitter } from "@cb/types";
import mitt from "mitt";

export const emitter: EventEmitter = mitt();
