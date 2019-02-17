// Copyright 2019 Stratumn
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import Ansi from "ansi-to-react";
import graphql from "babel-plugin-relay/macro";
import React from "react";
import ReactDOMServer from "react-dom/server";

import { createFragmentContainer } from "react-relay";

import { LogEntryMessage_item } from "./__generated__/LogEntryMessage_item.graphql";

import "./LogEntryMessage.css";

interface IAnchor {
  href: string;
}

function isAnchor(el: any): el is IAnchor {
  return "href" in el;
}

export interface IProps {
  item: LogEntryMessage_item;
  onClickSourceFile: (values: IProps) => any;
}

export function LogEntryMessage(props: IProps) {
  const {
    item: {
      message,
      sourceFile,
      sourceFileBegin,
      sourceFileEnd,
    },
    onClickSourceFile,
  } = props;

  if (!sourceFile) {
    return (
      <div className="LogEntryMessage">
        <Ansi
          linkify={true}
          useClasses={true}
        >
          {message}
        </Ansi>
      </div>
    );
  }

  // This is a hackish way to deal with both Ansi escape sequences and links
  // to source files, but a proper implementation will take time. Until then,
  // while far from beautiful, this should do the trick.

  const text = ReactDOMServer.renderToStaticMarkup(
    <Ansi
      linkify={true}
      useClasses={true}
    >
      {message}
    </Ansi>,
  );

  const source = message.substring(sourceFileBegin!, sourceFileEnd!);
  const href = `file://${sourceFile}`;
  const link = `<a href="${href}">${source}</a>`;
  const html = text.replace(source, link);
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (isAnchor(event.target) && event.target.href === href ) {
      onClickSourceFile({ ...props });
    }
  };

  return (
    <div
      className="LogEntryMessage"
      dangerouslySetInnerHTML={{ __html: html }}
      onClick={handleClick}
    />
  );
}

export default createFragmentContainer(LogEntryMessage, graphql`
  fragment LogEntryMessage_item on LogEntry {
    message
    sourceFile
    sourceFileBegin
    sourceFileEnd
  }`,
);
