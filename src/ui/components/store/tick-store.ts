import { atom } from "nanostores";
import { AppContext } from "../../../app/app-context";

const tickStore = atom<null | AppContext>(null)

export default tickStore