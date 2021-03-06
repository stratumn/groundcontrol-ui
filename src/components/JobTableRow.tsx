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
import { Button, Table } from "semantic-ui-react";

import { createFragmentContainer } from "react-relay";

import { JobTableRow_item } from "./__generated__/JobTableRow_item.graphql";

import Moment from "react-moment";

import "./JobTableRow.css";

const dateFormat = "LTS";

export interface IProps {
  item: JobTableRow_item;
  onStop: (values: IProps) => any;
}

export function JobTableRow(props: IProps) {
  const {
    item: { longString, createdAt, updatedAt, priority, status },
    onStop
  } = props;
  const buttons: JSX.Element[] = [];

  if (status === "QUEUED" || status === "RUNNING" || status === "STOPPING") {
    const handleStop = () => status !== "STOPPING" && onStop({ ...props });
    buttons.push(
      <Button
        key="stop"
        size="mini"
        basic={true}
        icon="stop"
        floated="right"
        loading={status === "STOPPING"}
        onClick={handleStop}
      />
    );
  }

  return (
    <Table.Row className="JobTableRow">
      <Table.Cell>{longString}</Table.Cell>
      <Table.Cell>
        <Moment format={dateFormat}>{createdAt}</Moment>
      </Table.Cell>
      <Table.Cell>
        <Moment format={dateFormat}>{updatedAt}</Moment>
      </Table.Cell>
      <Table.Cell>{priority.toLocaleLowerCase()}</Table.Cell>
      <Table.Cell
        positive={status === "RUNNING"}
        warning={status === "QUEUED"}
        error={status === "FAILED"}
      >
        {status.toLocaleLowerCase()}
      </Table.Cell>
      <Table.Cell className="JobTableRowActions">{buttons}</Table.Cell>
    </Table.Row>
  );
}

export default createFragmentContainer(
  JobTableRow,
  graphql`
    fragment JobTableRow_item on Job {
      id
      longString
      createdAt
      updatedAt
      priority
      status
    }
  `
);
