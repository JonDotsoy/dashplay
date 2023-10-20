import { FC, useState } from "react";
import StickyTop from "./common/sticky-top";
import classNames from "classnames";
import useSWR from "swr";
import useApi from "./api/use-api";


const Main: FC = () => {
  const { isLoading, data, error } = useApi("log-groups")

  console.log({ data })

  const [visible, setVisible] = useState(true)

  return (
    <>
      <StickyTop setVisible={setVisible}></StickyTop>
      <div className={classNames("bg-white backdrop-blur transition", { 'shadow': !visible })}>
        <nav className="flex container m-auto">
          <a href="/" className="p-4 hover:bg-gray-200 transition">Main</a>
        </nav>
      </div>
    </>
  )
}

export default Main
