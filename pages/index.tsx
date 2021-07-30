import { useEffect, useState } from "react";
import API, { graphqlOperation, GraphQLResult } from "@aws-amplify/api";
import { Observable } from "zen-observable-ts";
import { messagesByChannelID } from "../src/graphql/queries";
import { onCreateMessage } from "../src/graphql/subscriptions";
import { IMessage } from "../types/Message.types";
import { createMessage } from "../src/graphql/mutations";

export default function App() {
  const [messages, setMessages] = useState<IMessage[]>();
  const [messageBody, setMessageBody] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = (await API.graphql(
          graphqlOperation(messagesByChannelID, {
            channelID: "1",
            sortDirection: "ASC",
          })
        )) as GraphQLResult<any>;

        const items = res.data?.messagesByChannelID?.items;

        if (items) {
          setMessages(items);
        }
      } catch (error) {
        console.error("error: ", error);
      }
    };

    getMessages();

    const author = window.location.search.split("=")[1];
    setAuthor(author);
  }, []);

  useEffect(() => {
    let subscription;

    if (messages?.length) {
      subscription = (
        API.graphql(graphqlOperation(onCreateMessage)) as Observable<any>
      ).subscribe({
        next: (event) => {
          setMessages([...messages, event.value.data.onCreateMessage]);
        },
      });
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, [messages]);

  const handleChange = (event) => {
    setMessageBody(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const input = {
      channelID: "1",
      author,
      body: messageBody.trim(),
    };

    try {
      setMessageBody("");
      await API.graphql(graphqlOperation(createMessage, { input }));
    } catch (error) {
      console.warn(error);
    }
  };

  return (
    <div className="container">
      <div className="messages">
        <div className="messages-scroller">
          {/* messages will be loaded here */}
          {messages?.map((message) => (
            <div
              key={message.id}
              className={message.author === author ? "message me" : "message"}
            >
              {message.body}
            </div>
          ))}
        </div>
      </div>
      <div className="chat-bar">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="messageBody"
            placeholder="Type your message here"
            onChange={handleChange}
            value={messageBody}
          />
        </form>
      </div>
    </div>
  );
}
