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
import { Card, SemanticWIDTHS } from "semantic-ui-react";

import { ProjectCardGroup_items } from "./__generated__/ProjectCardGroup_items.graphql";

import ProjectCard, { IProps as IProjectCardProps } from "./ProjectCard";

export interface IProps {
  items: ProjectCardGroup_items;
  itemsPerRow: SemanticWIDTHS;
  onClone: (values: IProjectCardProps) => any;
  onPull: (values: IProjectCardProps) => any;
}

export function ProjectCardGroup(props: IProps) {
  const { items, itemsPerRow } = props;
  const cards = items.map((item) => (
    <ProjectCard
      {...props}
      key={item.id}
      item={item}
    />
   ));

  return (
    <Card.Group itemsPerRow={itemsPerRow}>
      {cards}
    </Card.Group>
  );
}

export default createFragmentContainer(ProjectCardGroup, graphql`
  fragment ProjectCardGroup_items on Project
    @argumentDefinitions(
      commitsLimit: { type: "Int", defaultValue: 3 },
    )
    @relay(plural: true) {
    ...ProjectCard_item @arguments(commitsLimit: $commitsLimit)
    id
  }`,
);
