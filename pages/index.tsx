import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Send2 } from "iconsax-react";
import { io } from "socket.io-client";

const inter = Inter({ subsets: ["latin"] });

interface MessageType {
  message: string;
  type: "NOTIFICATION" | "MESSAGE";
  isSender?: boolean;
  createdAt: number;
}

const socket = io(
  /* "http://localhost:8000" */ "https://chat-bot-u7ou.onrender.com",
  {}
);
export default function Home() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState("");
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    setPageLoaded((prevState) => {
      if (!prevState) {
        socket.emit("connect_app");
        socket.on("connection", (socket) => {
          console.log(socket.id); // x8WIv7-mJelg7on_ALbx
        });
        socket.on("connection_successful", ({ socket_id }) => {
          // console.log(socket_id); // x8WIv7-mJelg7on_ALbx
          setMessages((prevState) => [
            ...prevState,
            {
              message: `You initiated this conversation`,
              type: "NOTIFICATION",
              isSender: true,
              createdAt: Date.now()
            }
          ]);
          setIsConnected(true);
          setSocketId(socket_id);
        });
        socket.on("response", ({ response }) => {
          // console.log("received a response", response);
          setMessages((prevState) => [
            ...prevState,
            {
              message: response,
              type: "MESSAGE",
              isSender: false,
              createdAt: Date.now()
            }
          ]);
        });
      }

      return true;
    });
  }, []);

  useEffect(() => {
    window.scrollTo({
      left: 0,
      top: window.innerHeight
    });
  }, [messages]);

  const {
    register,
    reset,
    formState: { errors, isDirty },
    handleSubmit
  } = useForm({
    defaultValues: {
      message: ""
    }
  });
  const processForm = (data: { message: string }) => {
    const { message } = data || {};

    if (!message) {
      return;
    }
    setMessages((prevState) => [
      ...prevState,
      {
        message,
        type: "MESSAGE",
        isSender: true,
        createdAt: Date.now()
      }
    ]);
    socket.emit("message", data);
    reset({
      message: ""
    });
  };
  return (
    <>
      {!isConnected && (
        <div className="w-screen h-screen fixed z-[9900] flex flex-col items-center justify-center bg-white">
          <p>Connecting... Please wait</p>
        </div>
      )}
      <div className="relative">
        <div className="sticky top-0 bg-slate-100  px-10 py-6">
          <h1>User #{socketId}</h1>
        </div>
        <div className="pb-24 px-10">
          {messages &&
            messages.map(({ createdAt, isSender, message, type }) => (
              <div
                className={`py-5 flex flex-col ${
                  type === "NOTIFICATION" ? "items-center" : ""
                }`}
                key={createdAt}
              >
                {type === "NOTIFICATION" && (
                  <p className="w-full text-center opacity-60 max-w-[90%]">
                    {message}
                  </p>
                )}
                {type === "MESSAGE" && (
                  <div
                    className={`p-4 ${
                      isSender
                        ? "bg-blue-600 rounded-tr-none text-white self-end"
                        : "bg-slate-100 rounded-tl-none self-start"
                    } max-w-[70%] rounded-2xl `}
                  >
                    {message}
                  </div>
                )}
              </div>
            ))}
        </div>
        <form
          onSubmit={handleSubmit(processForm)}
          className="w-full py-6 fixed left-0 bottom-0 bg-blue-300 items-center gap-10 flex px-10"
        >
          <input
            placeholder="Please type your message here..."
            {...register("message", { required: true })}
            className={`py-3 px-5 border rounded-full focus:border-blue-500 outline-none flex-1 ${
              errors?.message ? "border-red-600" : ""
            }`}
          />
          <button
            title="Send message"
            disabled={!isDirty}
            className="size-10  bg-blue-500 disabled:bg-slate-200 rounded-full items-center justify-center flex"
          >
            <Send2
              size={25}
              color={isDirty ? "white" : "rgba(0,0,0,.7)"}
              variant="Bold"
            />
          </button>
        </form>
      </div>
    </>
  );
}
