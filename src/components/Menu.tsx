import { Item, Menu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

export default function ContextMenu({
  id,
  handleItemClick,
}: {
  id: string;
  handleItemClick: (menu: string) => void;
}) {
  return (
    <Menu id={id} className="context">
      <Item onClick={() => handleItemClick("love")}>
        <p className="mr-auto">Love</p>🥰
      </Item>
      <Item onClick={() => handleItemClick("like")}>
        <p className="mr-auto">Like</p>👍
      </Item>
      <Item onClick={() => handleItemClick("smile")}>
        <p className="mr-auto">Smile</p>😁
      </Item>
    </Menu>
  );
}
