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

import { ServiceTable_items } from "./__generated__/ServiceTable_items.graphql";

import ServiceTableRow, { IProps as IServiceTableRowProps } from "./ServiceTableRow";

export interface IProps {
  items: ServiceTable_items;
  onStart: (values: IServiceTableRowProps) => any;
  onStop: (values: IServiceTableRowProps) => any;
}

export function ServiceTable({ items, onStart, onStop }: IProps) {
  if (items.length < 1) {
    return <p>There are no services at this time.</p>;
  }

  const rows = items.map((item) => (
    <ServiceTableRow
      key={item.id}
      item={item}
      onStop={onStop}
      onStart={onStart}
    />
  ));

  return (
    <Table basic="very">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Workspace</Table.HeaderCell>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell width="2" />
        </Table.Row>
      </Table.Header>
      <Table.Body>{rows}</Table.Body>
    </Table>
  );
}

export default createFragmentContainer(ServiceTable, graphql`
  fragment ServiceTable_items on Service
    @relay(plural: true) {
    id
    ...ServiceTableRow_item
  }`,
);
