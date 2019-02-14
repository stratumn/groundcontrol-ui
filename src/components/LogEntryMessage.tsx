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

import graphql from "babel-plugin-relay/macro";
import React, { Fragment } from "react";

import { createFragmentContainer } from "react-relay";

import { LogEntryMessage_item } from "./__generated__/LogEntryMessage_item.graphql";

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
      <Fragment>
        {message}
      </Fragment>
    );
  }

  const preSource = message.substring(0, sourceFileBegin!);
  const source = message.substring(sourceFileBegin!, sourceFileEnd!);
  const postSource = message.substring(sourceFileEnd!);
  const handleClickSource = (event: React.MouseEvent) => {
    event.preventDefault();
    onClickSourceFile({ ...props });
  };

  return (
    <Fragment>
      {preSource}
      <a
        href={`file:///${sourceFile}`}
        onClick={handleClickSource}
      >
        {source}
      </a>
      {postSource}
    </Fragment>
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
