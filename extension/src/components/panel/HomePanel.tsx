import { CreateRoomDialog } from "@cb/components/dialog/CreateRoomDialog";
import { JoinRoomDialog } from "@cb/components/dialog/JoinRoomDialog";
import { decrement, increment } from "@cb/state/session/counterSlice";
import { RootState } from "@cb/state/store";
import { useDispatch, useSelector } from "react-redux";
import { DefaultPanel } from "./DefaultPanel";
const HomePanel = () => {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <DefaultPanel>
      <div className="flex min-w-max flex-col items-center gap-3">
        <button onClick={() => dispatch(increment())}>+</button>
        <span className="text-2xl font-bold">{count}</span>
        <button onClick={() => dispatch(decrement())}>-</button>

        <CreateRoomDialog />
        <JoinRoomDialog />
      </div>
    </DefaultPanel>
  );
};

export default HomePanel;
