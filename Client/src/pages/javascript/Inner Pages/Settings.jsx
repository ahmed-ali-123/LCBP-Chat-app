import React, { useCallback, useEffect, useState } from "react";
import "../../css/settings.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatCard from "../../../components/javascript/ChatCard";
import pfp from "../../../images/defaultpic.jpg";
import Button from "../../../components/javascript/Button";
import { useDispatch, useSelector } from "react-redux";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Confirm from "./Confirm";
import { useSnackbar } from "notistack";
import { setUser } from "../../../Redux/Features/userSlice";

const Settings = (props) => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const [privacypage, setPrivacypage] = useState(false);
  const [blockedpage, setBlockedpage] = useState(false);
  const [showoptions, setShowOptions] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPasswordBox, setShowPasswordBox] = useState(false);
  const [noUsers, setNoUsers] = useState(false);
  const [reload, setReload] = useState(false);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [passinput, setPassinput] = useState("");
  const [pfpChecked, setPfpChecked] = useState(user.img || "everyone");
  const [chatChecked, setChatChecked] = useState(user.chat || "everyone");
  const [count, setCount] = useState(0);

  const updatePrivacy = async () => {
    try {
      let response = await fetch("https://lcbp-api.vercel.app/auth/privacy", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          privacy: {
            img: pfpChecked,
            chat: chatChecked,
          },
        }),
      });
      let res = await response.json();
      if (res.success) {
        enqueueSnackbar("Privacy updated.", { variant: "success" });
        let temp = {
          name: res.user.name,
          username: res.user.username,
          id: res.user._id,
          imageurl: res.user.imageurl,
          about: res.user.about,
          img: res.user.privacy.img,
          chat: res.user.privacy.chat,
        };
        dispatch(setUser(temp));
      } else {
        enqueueSnackbar("Server error.", { variant: "error" });
      }
    } catch (e) {
      enqueueSnackbar("Server error.", { variant: "error" });
    }
  };

  useEffect(() => {
    let fetchBlocked = async () => {
      try {
        let blockedUsers = await fetch(
          "https://lcbp-api.vercel.app/auth/getBlocked",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
            }),
          }
        );
        let Users = await blockedUsers.json();
        if (Users.NoBlocked) {
          setNoUsers(true);
        } else {
          setUsers(Users.Blocked);
        }
      } catch (e) {
        enqueueSnackbar("Server error.", { variant: "error" });
      }
    };
    fetchBlocked();
  }, [reload]);

  let addUser = (id) => {
    if (selected.includes(id)) {
      let temp = selected.filter((userid) => {
        return userid !== id;
      });
      setSelected(temp);
    } else {
      setSelected([...selected, id]);
    }
  };
  let unBlock = async () => {
    try {
      let response = await fetch("https://lcbp-api.vercel.app/auth/unblock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          selected,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      let data = await response.json();
      if (!data.success) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      } else {
        setReload(!reload);
      }
    } catch (e) {
      enqueueSnackbar("Server error.", { variant: "error" });
    }
  };

  let confirmPass = async () => {
    try {
      let result = await fetch("https://lcbp-api.vercel.app/auth/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          password: passinput,
        }),
      });
      let res = await result.json();
      if (res.success) {
        setConfirmMessage(
          "Are you sure you want to Delete you account permanently ?"
        );
        setShowConfirm(true);
      } else {
        if (count >= 5) {
          localStorage.removeItem("id");
          navigate("/login");
          enqueueSnackbar("Please login again.", { variant: "error" });
        } else {
          setCount(count + 1);
          enqueueSnackbar("Wrong Password", { variant: "error" });
        }
      }
    } catch (e) {
      enqueueSnackbar("Server error.", { variant: "error" });
    }
  };
  let DeleteAccount = async () => {
    try {
      let result = await fetch("https://lcbp-api.vercel.app/auth/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
        }),
      });
      let res = await result.json();
      if (res.success) {
        enqueueSnackbar("Account Deleted.", { variant: "success" });
        localStorage.removeItem("id");
        navigate("/login");
      } else {
        enqueueSnackbar("Server error.", { variant: "error" });
      }
    } catch (e) {
      enqueueSnackbar("Server error.", { variant: "error" });
    }
  };

  return (
    <div
      className="settingspage"
      style={props.display === true ? { display: "flex" } : { display: "none" }}
    >
      <ArrowBackIcon
        className="backarrow"
        onClick={() => {
          if (privacypage) {
            setPrivacypage(false);
          } else if (blockedpage) {
            setBlockedpage(false);
          } else {
            props.off();
          }
        }}
      />
      {privacypage ? (
        <>
          <h1 className="heading">Privacy</h1>
          <div className="privacy">
            <p
              onClick={() => {
                setShowOptions("pfp");
              }}
            >
              Profile picture visiblity. <span>{pfpChecked}</span>
            </p>
            <p
              onClick={() => {
                setShowOptions("chat");
              }}
            >
              Who can start chat with you. <span>{chatChecked}</span>
            </p>
          </div>
        </>
      ) : blockedpage ? (
        <>
          <h1 className="heading">Blocked Users</h1>
          <div className="options">
            {noUsers ? (
              <>
                <span className="noUsers">No Users Blocked</span>
              </>
            ) : (
              <div className="cards settingsCards">
                <>
                  {users?.map((e) => {
                    return (
                      <ChatCard
                        selected={selected.includes(e._id)}
                        key={e._id}
                        pfp={e.imageurl}
                        name={e.name}
                        username={e.username}
                        onclick={() => {
                          addUser(e._id);
                        }}
                      />
                    );
                  })}
                </>
              </div>
            )}

            <div className="settingsButton">
              {selected.length === 0 ? (
                <Button
                  theme="light"
                  submit={() => {
                    enqueueSnackbar("No users selected.", { variant: "error" });
                  }}
                  text="Unblock"
                />
              ) : (
                <Button
                  theme="gradient"
                  submit={() => {
                    setConfirmMessage(
                      "Are you sure you want to unblock these Users ?"
                    );
                    setShowConfirm(true);
                  }}
                  text="Unblock"
                />
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {" "}
          <h1 className="heading">Settings</h1>
          <div className="options">
            <p
              onClick={() => {
                setPrivacypage(true);
              }}
            >
              Privacy
            </p>
            <p
              onClick={() => {
                setBlockedpage(true);
              }}
            >
              Blocked Users
            </p>
            <p
              onClick={() => {
                setConfirmMessage(
                  `${user.name}, Are you sure you want to Log out`
                );
                setShowConfirm(true);
              }}
            >
              Log Out
            </p>
            <p
              onClick={() => {
                setShowPasswordBox(true);
              }}
            >
              Delete Account
            </p>
            <p>Contact LCBP Manager</p>
          </div>
        </>
      )}
      {showoptions === "pfp" ? (
        <div className="opts">
          <div className="optionsbar">
            {}
            <div>
              <label htmlFor="everyone">Everyone</label>
              <input
                type="radio"
                name="option"
                id="everyone"
                checked={pfpChecked === "everyone"}
                onChange={(e) => setPfpChecked(e.target.id)}
              />
            </div>
            <div>
              <label htmlFor="none">No one</label>
              <input
                type="radio"
                name="option"
                id="none"
                checked={pfpChecked === "none"}
                onChange={(e) => setPfpChecked(e.target.id)}
              />
            </div>
            <div>
              <label htmlFor="chats">Onle users I have chats with</label>
              <input
                type="radio"
                name="option"
                id="chats"
                checked={pfpChecked === "chats"}
                onChange={(e) => setPfpChecked(e.target.id)}
              />
            </div>
          </div>
          <div
            className="blur"
            onClick={() => {
              setShowOptions("");
              updatePrivacy();
            }}
          ></div>
        </div>
      ) : showoptions === "chat" ? (
        <div className="opts">
          <div className="optionsbar">
            {}
            <div>
              <label htmlFor="everyone">Everyone</label>
              <input
                type="radio"
                name="option"
                id="everyone"
                checked={chatChecked === "everyone"}
                onChange={(e) => setChatChecked(e.target.id)}
              />
            </div>

            <div>
              <label htmlFor="none">No one</label>
              <input
                type="radio"
                name="option"
                id="none"
                checked={chatChecked === "none"}
                onChange={(e) => setChatChecked(e.target.id)}
              />
            </div>
          </div>
          <div
            className="blur"
            onClick={() => {
              setShowOptions("");
              updatePrivacy();
            }}
          ></div>
        </div>
      ) : (
        <></>
      )}
      {showPasswordBox ? (
        <>
          <div
            className="blur"
            onClick={() => {
              setShowPasswordBox(false);
            }}
          ></div>
          <div className="passdiv">
            <h2>Please enter your password : </h2>
            <input
              type="password"
              placeholder="pasword"
              value={passinput}
              onChange={(e) => {
                setPassinput(e.target.value);
              }}
            />
            <button
              onClick={() => {
                confirmPass();
              }}
            >
              Confirm
            </button>
          </div>
        </>
      ) : (
        <></>
      )}

      <Confirm
        visible={showConfirm}
        hide={() => {
          setShowConfirm(false);
        }}
        message={confirmMessage}
        yes={() => {
          setShowConfirm(false);
          if (
            confirmMessage === `${user.name}, Are you sure you want to Log out`
          ) {
            localStorage.removeItem("id");
            navigate("/login");
          } else if (
            confirmMessage === "Are you sure you want to unblock these Users ?"
          ) {
            unBlock();
          } else if (
            confirmMessage ===
            "Are you sure you want to Delete you account permanently ?"
          ) {
            DeleteAccount();
          }
        }}
      />
    </div>
  );
};

export default Settings;
