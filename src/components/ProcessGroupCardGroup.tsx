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
import { Card, Segment } from "semantic-ui-react";

import { ProcessGroupCardGroup_items } from "./__generated__/ProcessGroupCardGroup_items.graphql";

import ProcessGroupCard, { IProps as IProcessGroupCardProps } from "./ProcessGroupCard";
import { IProps as IProcessTableRowProps } from "./ProcessTableRow";

export interface IProps {
  items: ProcessGroupCardGroup_items;
  onStartGroup: (values: IProcessGroupCardProps) => any;
  onStopGroup: (values: IProcessGroupCardProps) => any;
  onStartProcess: (values: IProcessTableRowProps) => any;
  onStopProcess: (values: IProcessTableRowProps) => any;
}

export function ProcessGroupCardGroup(props: IProps) {
  const { items } = props;

  if (items.length < 1) {
    return <Segment>There are no processes at this time.</Segment>;
  }

  const cards = items.map((item) => (
    <ProcessGroupCard
      {...props}
      key={item.id}
      item={item}
    />
   ));

  return <Card.Group>{cards}</Card.Group>;
}

export default createFragmentContainer(ProcessGroupCardGroup, graphql`
  fragment ProcessGroupCardGroup_items on ProcessGroup
    @relay(plural: true) {
    id
    ...ProcessGroupCard_item
  }`,
);
