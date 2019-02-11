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
import React from "react";
import { createFragmentContainer } from "react-relay";
import {
  Button,
  Table,
 } from "semantic-ui-react";

import { ProcessTableRow_item } from "./__generated__/ProcessTableRow_item.graphql";

import RepositoryShortName from "./RepositoryShortName";

import "./ProcessTableRow.css";

export interface IProps {
  item: ProcessTableRow_item;
  onStartProcess: (values: IProps) => any;
  onStopProcess: (values: IProps) => any;
}

export function ProcessTableRow(props: IProps) {
  const {
    item: {
      command,
      status,
      project: {
        repository,
      },
    },
    onStartProcess,
    onStopProcess,
  } = props;
  const buttons: JSX.Element[] = [];
  const handleStart = () => onStartProcess(props);
  const handleStop = () => onStopProcess(props);

  switch (status) {
  case "DONE":
  case "FAILED":
    buttons.push((
      <Button
        key="start"
        compact={true}
        size="mini"
        icon="play"
        content="Start"
        onClick={handleStart}
      />
    ));
    break;
  case "RUNNING":
    buttons.push((
      <Button
        key="stop"
        size="mini"
        compact={true}
        icon="stop"
        content="Stop"
        onClick={handleStop}
      />
    ));
    break;
  case "STOPPING":
    buttons.push((
      <Button
        key="stop"
        size="mini"
        compact={true}
        icon="stop"
        content="Stop"
        disabled={true}
        loading={true}
      />
    ));
    break;
  }

  return (
    <Table.Row className="ProcessTableRow">
      <Table.Cell collapsing={true}>
        <RepositoryShortName repository={repository} />
      </Table.Cell>
      <Table.Cell
        className="ProcessTableRowCommand"
      >
        {command}
      </Table.Cell>
      <Table.Cell
        positive={status === "DONE"}
        warning={status === "RUNNING"}
        error={status === "FAILED"}
        collapsing={true}
      >
        {status}
      </Table.Cell>
      <Table.Cell
        className="ProcessTableRowActions"
        collapsing={true}
      >
        {buttons}
      </Table.Cell>
    </Table.Row>
  );
}

export default createFragmentContainer(ProcessTableRow, graphql`
  fragment ProcessTableRow_item on Process {
    id
    command
    status
    project {
      repository
    }
  }`,
);
