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
import { Link } from "found";
import React from "react";
import { Button, Table } from "semantic-ui-react";

import { createFragmentContainer } from "react-relay";

import { ServiceTableRow_item } from "./__generated__/ServiceTableRow_item.graphql";

import "./ServiceTableRow.css";

export interface IProps {
  item: ServiceTableRow_item;
  onStart: (values: IProps) => any;
  onStop: (values: IProps) => any;
}

export function ServiceTableRow(props: IProps) {
  const {
    item: {
      name,
      status,
      workspace,
    },
    onStart,
    onStop,
  } = props;
  const buttons: JSX.Element[] = [];

  if (status === "STOPPED" || status === "FAILED") {
    const handleStart = () => onStart({ ...props });
    buttons.push((
      <Button
        key="start"
        size="mini"
        compact={true}
        icon="play"
        content="Start"
        onClick={handleStart}
      />
    ));
  }

  if (status === "RUNNING") {
    const handleStop = () => onStop({ ...props });
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
  }

  return (
    <Table.Row className="ServiceTableRow">
      <Table.Cell>
        <Link to={`/workspaces/${workspace.slug}`}>
          {workspace.name}
        </Link>
      </Table.Cell>
      <Table.Cell>{name}</Table.Cell>
      <Table.Cell
        positive={status === "RUNNING"}
        warning={status === "STARTING" || status === "STOPPING"}
        error={status === "FAILED"}
      >
        {status}
      </Table.Cell>
      <Table.Cell className="ServiceTableRowActions">
        {buttons}
      </Table.Cell>
    </Table.Row>
  );
}

export default createFragmentContainer(ServiceTableRow, graphql`
  fragment ServiceTableRow_item on Service {
    id
    name
    status
    workspace {
      slug
      name
    }
  }`,
);
