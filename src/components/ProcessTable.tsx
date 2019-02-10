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
import { Table } from "semantic-ui-react";

import { ProcessTable_items } from "./__generated__/ProcessTable_items.graphql";

import ProcessTableRow, { IProps as IProcessTableRowProps } from "./ProcessTableRow";

import "./ProcessTable.css";

export interface IProps {
  items: ProcessTable_items;
  onStartProcess: (values: IProcessTableRowProps) => any;
  onStopProcess: (values: IProcessTableRowProps) => any;
}

export function ProcessTable(props: IProps) {
  const { items } = props;
  const rows = items.map((item) => (
    <ProcessTableRow
      {...props}
      key={item.id}
      item={item}
    />
  ));

  return (
    <Table
      className="ProcessTable"
      inverted={true}
    >
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Project</Table.HeaderCell>
          <Table.HeaderCell>Command</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell />
        </Table.Row>
      </Table.Header>
      <Table.Body>{rows}</Table.Body>
    </Table>
  );
}

export default createFragmentContainer(ProcessTable, graphql`
  fragment ProcessTable_items on Process
    @relay(plural: true) {
    ...ProcessTableRow_item
    id
  }`,
);
