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

import { LogEntryTable_items } from "./__generated__/LogEntryTable_items.graphql";

import { IProps as ILogEntryMessageProps } from "./LogEntryMessage";
import LogEntryTableRow from "./LogEntryTableRow";

export interface IProps {
  items: LogEntryTable_items;
  onClickSourceFile: (values: ILogEntryMessageProps) => any;
}

export function LogEntryTable({ items, onClickSourceFile }: IProps) {
  if (items.length < 1) {
    return (
      <Table inverted={true}>
        <Table.Body>
          <Table.Row>
            <Table.Cell>There are no log entries at this time.</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );
  }

  const rows = items.map((item, index) => (
    <LogEntryTableRow
      key={item.id}
      item={item}
      prevItem={index > 0 ? items[index - 1] : null}
      onClickSourceFile={onClickSourceFile}
    />
  ));

  return (
    <Table inverted={true}>
      <Table.Body>{rows}</Table.Body>
    </Table>
  );
}

export default createFragmentContainer(LogEntryTable, graphql`
  fragment LogEntryTable_items on LogEntry
    @relay(plural: true) {
    ...LogEntryTableRow_item
    ...LogEntryTableRow_prevItem
    id
  }`,
);
