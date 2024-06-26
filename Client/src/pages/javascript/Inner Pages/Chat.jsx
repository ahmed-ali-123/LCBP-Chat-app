import React, { useRef, useEffect, useState, useCallback } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SendIcon from "@mui/icons-material/Send";
import logo from "../../../images/transparentlogo.png";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useParams } from "react-router-dom";
import pfp from "../../../images/defaultpic.jpg";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { TailSpin } from "react-loader-spinner";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import Confirm from "./Confirm";
import AddUsers from "./AddUsers";
import EmojiPicker from "emoji-picker-react";

export default function Chat(props) {
  //------------------------------- Variables and Hooks --------------------------------------------

  const refresh = localStorage.getItem("refresh");
  const { id } = useParams();
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);
  const user = useSelector((state) => state.user);
  const { enqueueSnackbar } = useSnackbar();

  //----------------------------------- States ---------------------------------------------------

  const [messege, setMessege] = useState("");
  const [showdrop, setShowdrop] = useState(false);
  const [messeges, setMesseges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [admin, setAdmin] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [latestMessage, setLatestMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showaddUsers, setShowAddUsers] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [fnc, setfnc] = useState("");

  // --------------------------------  UseEffects -----------------------------------------------

  useEffect(() => {
    setLoading(true);
    setMesseges([]);

    const fetchData = async () => {
      try {
        if (!user.id || !id) return;

        const res = await fetch("https://lcbp-api.vercel.app/messages/get", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatID: id,
            userID: user.id,
          }),
        });
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const result = await res.json();

        if (result.success === false) {
          if (result.message === "No messages found") {
            if (result.group) {
              setAdmin(result.admin);
              setImage(result.imageurl);
            }

            if (result.data.name) {
              setName(result.data.name);
            } else {
              let updatedData = result.data.filter(
                (userObj) => userObj.id !== user.id
              );
              setName(updatedData[0].name);
              setImage(updatedData[0].imageurl);
            }
            setIsGroup(result.group);
            setLoading(false);
            return;
          }
          throw new Error("An unexpected error occurred!");
        } else {
          if (result.group) {
            setAdmin(result.admin);
            setImage(result.imageurl);
          }
          if (result.data.name) {
            setName(result.data.name);
          } else {
            let updatedData = result.data.filter(
              (userObj) => userObj.id !== user.id
            );
            setName(updatedData[0].name);
            setImage(updatedData[0].imageurl);
          }
          setIsGroup(result.group);
          setMesseges(result.messages);
          setLatestMessage(
            result.messages[result.messages.length - 1]?.content
          );
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
        navigate("/chats");
        enqueueSnackbar("An error occured.", { variant: "error" });
      }
    };

    fetchData();
  }, [id, user.id]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo(
        0,
        chatContainerRef.current.scrollHeight
      );
    }
  }, [messeges]);

  useEffect(() => {
    let intervalId = setInterval(async () => {
      if (!id) return;
      console.log("Ran");
      try {
        const res = await fetch(
          "https://lcbp-api.vercel.app/messages/getlatest",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatID: id, userID: user.id }),
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const { messages } = await res.json();

        setMesseges(messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        enqueueSnackbar(error.message || "An error occurred.", {
          variant: "error",
        });
      }
    }, 2000);
    return () => {
      clearInterval(intervalId);
    };
  }, [id]);

  //  ----------------------------- Functions -----------------------------------------

  const handleChange = (e) => {
    setMessege(e.target.value);
  };

  let deletechat = async (m) => {
    try {
      const res = await fetch("https://lcbp-api.vercel.app/chats/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatID: id,
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const result = await res.json();
      if (result.success === true) {
        navigate("/chats");
        if (refresh === "true") localStorage.setItem("refresh", false);
        else localStorage.setItem("refresh", true);

        enqueueSnackbar(m, { variant: "success" });
        setShowdrop(false);
      }
    } catch (e) {
      enqueueSnackbar("An error occured.", { variant: "error" });
    }
  };

  let exitgroup = async (message) => {
    try {
      const res = await fetch("https://lcbp-api.vercel.app/chats/exit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatID: id,
          userID: user.id,
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const result = await res.json();
      if (result.success === true) {
        navigate("/chats");
        if (refresh === "true") localStorage.setItem("refresh", false);
        else localStorage.setItem("refresh", true);

        enqueueSnackbar(message, { variant: "success" });
      }
    } catch (e) {
      enqueueSnackbar("An error occured.", { variant: "error" });
    }
  };
  function generateRandomString(length) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  }
  let addMessege = async () => {
    if (messege === "") {
      return;
    }
    try {
      setLatestMessage(messege);
      if (!user.id || !id) throw new Error(`HTTP error! Status: ${res.status}`);
      setMessege("");
      const res = await fetch("https://lcbp-api.vercel.app/messages/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatID: id,
          userID: user.id,
          content: messege,
          _id: generateRandomString(15),
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const result = await res.json();

      if (result.success === false) {
        throw new Error("An unexpected error occurred!");
      }
    } catch (e) {
      navigate("/chats");
      enqueueSnackbar("An error occured.", { variant: "error" });
    }
  };

  let blockUser = async () => {
    const res = await fetch("https://lcbp-api.vercel.app/auth/block", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId: id,
        userId: user.id,
      }),
    });
    let response = await res.json();
    if (response.success) {
      deletechat("User blocked successfully.");
    } else {
      navigate("/chats");
      enqueueSnackbar("An error occured.", { variant: "error" });
    }
  };

  let cont = () => {
    if (fnc === "DeleteChat") {
      deletechat("Chat deleted.");
      setfnc("");
    } else if (fnc === "BlockChat") {
      blockUser();
      setfnc("");
    } else if (fnc === "Report") {
      enqueueSnackbar(
        "the User has been reported. we will see their activity and take actions",
        { variant: "warning" }
      );
      setfnc("");
    } else if (fnc === "ReportGroup") {
      enqueueSnackbar(
        "This Group has been reported. we will see the activity and take actions",
        { variant: "warning" }
      );
      setfnc("");
    } else if (fnc === "DeleteGroup") {
      deletechat("Group Deleted successfully.");
      setfnc("");
    } else if (fnc === "ExitGroup") {
      exitgroup("Group Exited Successfully");
      setfnc("");
    } else {
      enqueueSnackbar("Something went wrong.", { variant: "error" });
      setfnc("");
    }
  };

  //--------------------------------  JSX  --------------------------------------------------

  return (
    <div className="rightpage">
      {id === undefined || loading ? (
        <></>
      ) : (
        <div className="rightSideTopBar">
          <div className="left">
            <div className="arrow">
              <ArrowBackIcon
                className="backarrow"
                onClick={() => {
                  navigate("/chats");
                }}
              />
            </div>
            <div className="barleftdiv">
              <img
                src={image || pfp}
                style={
                  isGroup
                    ? { border: "2px solid #12e269" }
                    : { border: "2px solid #9c08ff" }
                }
                onClick={() => {
                  props.detailspage();
                }}
              />
              <div>
                <h3
                  onClick={() => {
                    props.detailspage();
                  }}
                >
                  {name}
                </h3>
              </div>
            </div>
          </div>
          <div className="dots" onClick={() => {}}>
            {showdrop ? (
              <>
                <CloseIcon
                  className="dotsicon"
                  onClick={() => {
                    setShowdrop(false);
                  }}
                />
                {isGroup ? (
                  admin === user.id ? (
                    <div className="dropmenu">
                      <p
                        onClick={() => {
                          setShowdrop(false);
                          setShowAddUsers(true);
                        }}
                      >
                        Add members
                      </p>
                      <p
                        onClick={() => {
                          setConfirmMessage(
                            "Are you sure you want to delete this group ?"
                          );
                          setShowConfirm(true);
                          setfnc("DeleteGroup");
                          setShowdrop(false);
                        }}
                      >
                        Delete Group
                      </p>
                    </div>
                  ) : (
                    <div className="dropmenu">
                      <p
                        onClick={() => {
                          setConfirmMessage(
                            "Are you sure you want to exit this group ?"
                          );
                          setShowConfirm(true);
                          setfnc("ExitGroup");
                          setShowdrop(false);
                        }}
                      >
                        Exit Group
                      </p>
                      <p
                        onClick={() => {
                          setConfirmMessage(
                            "Are you sure you want to Report this group ?"
                          );
                          setShowConfirm(true);
                          setfnc("ReportGroup");
                          setShowdrop(false);
                        }}
                      >
                        Report group
                      </p>
                    </div>
                  )
                ) : (
                  <div className="dropmenu">
                    <p
                      onClick={() => {
                        setConfirmMessage(
                          "Are you sure you want to Delete this chat ?"
                        );
                        setShowConfirm(true);
                        setfnc("DeleteChat");
                        setShowdrop(false);
                      }}
                    >
                      Delete Chat
                    </p>
                    <p
                      onClick={() => {
                        setConfirmMessage(
                          "Are you sure you want to Block this user ?"
                        );
                        setShowConfirm(true);
                        setfnc("BlockChat");
                        setShowdrop(false);
                      }}
                    >
                      Block User
                    </p>
                    <p
                      onClick={() => {
                        setConfirmMessage(
                          "Are you sure you want to Report this user ?"
                        );
                        setShowConfirm(true);
                        setfnc("Report");
                        setShowdrop(false);
                      }}
                    >
                      Report User
                    </p>
                  </div>
                )}
              </>
            ) : (
              <MoreVertIcon
                onClick={() => {
                  setShowdrop(true);
                }}
                className="dotsicon"
              />
            )}
          </div>
        </div>
      )}

      <div className="messeges" ref={chatContainerRef}>
        {id === undefined ? (
          <img src={logo} alt="logo" className="chatlogo" />
        ) : loading ? (
          <div
            style={{
              width: "100%",
              height: "300px",
              display: "grid",
              placeItems: "center",
            }}
          >
            <TailSpin
              visible={true}
              height="45"
              width="45"
              color="black"
              ariaLabel="tail-spin-loading"
              radius="1"
              wrapperStyle={{}}
              wrapperClass=""
            />
          </div>
        ) : messeges.length === 0 ? (
          <>
            <p className="noresults">No messages yet.</p>
          </>
        ) : (
          <div className="messegesDiv">
            {messeges.map((e) => {
              return (
                <div
                  key={e._id}
                  className={
                    ("messegeDiv", e.senderID === user.id ? "yes" : "no")
                  }
                >
                  <p className="messege">
                    {e.senderID !== user.id && isGroup ? (
                      <span className="name">{e.username}</span>
                    ) : (
                      <></>
                    )}{" "}
                    {e.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="emojis">
        <EmojiPicker
          open={showEmoji}
          onEmojiClick={(emoji) => {
            setMessege(messege + " " + emoji.emoji);
          }}
        />
      </div>
      {id === undefined || loading ? (
        <></>
      ) : (
        <div className="inputTabParent">
          <div className="inputTab">
            <div
              className="emoji"
              onClick={() => {
                setShowEmoji(!showEmoji);
              }}
            >
              <EmojiEmotionsIcon />
            </div>
            <input
              onChange={(e) => {
                handleChange(e);
              }}
              value={messege}
              placeholder="Type here..."
              className="messegeInput"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  messege.length === 0 ? null : addMessege();
                }
              }}
            />
            {messeges[messeges.length - 1]?.content === latestMessage ||
            messeges[messeges.length - 1]?.username !== user.username ||
            latestMessage === "" ? (
              <SendIcon
                onClick={() => {
                  addMessege();
                }}
              />
            ) : (
              <TailSpin
                visible={true}
                height="25"
                width="25"
                color="black"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            )}
          </div>
        </div>
      )}

      <Confirm
        visible={showConfirm}
        hide={() => {
          setShowConfirm(false);
        }}
        message={confirmMessage}
        yes={() => {
          cont(fnc);
          setShowConfirm(false);
        }}
      />

      <AddUsers
        visible={showaddUsers}
        hide={() => {
          setShowAddUsers(false);
        }}
      />
    </div>
  );
}
