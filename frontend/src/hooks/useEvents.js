import { useContext } from "react";
import { EventContext } from "../context/contexts";

export default function useEvents() {
  return useContext(EventContext);
}
