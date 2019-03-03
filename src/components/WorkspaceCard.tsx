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
import { createFragmentContainer } from "react-relay";
import {
  Card,
  Header,
  Label,
 } from "semantic-ui-react";

import { WorkspaceCard_item } from "./__generated__/WorkspaceCard_item.graphql";

import ProjectList from "./ProjectList";

import "./WorkspaceCard.css";

export interface IProps {
  item: WorkspaceCard_item;
  onClone: (values: IProps) => any;
  onPull: (values: IProps) => any;
}

export function WorkspaceCard(props: IProps) {
  const {
    item: {
      slug,
      name,
      description,
      projects,
    },
  } = props;
  const labels: JSX.Element[] = [];
  const projectNodes = projects.edges.map(({ node }) => node);
  const projectCount = projectNodes.length;
  const clonedCount = projectNodes.filter((node) => node.isCloned).length;
  const behindCount = projectNodes.filter((node) => node.isBehind).length;
  const aheadCount = projectNodes.filter((node) => node.isAhead).length;
  const cleanCount = projectNodes.filter((node) => node.isClean).length;

  if (clonedCount === projectCount) {
    labels.push((
      <Label
        key="cloned"
        content="cloned"
        color="blue"
        size="small"
      />
    ));
  } else if (clonedCount > 0) {
    labels.push((
      <Label
        key="cloned"
        content="partially cloned"
        color="blue"
        size="small"
      />
    ));
  }
  if (clonedCount > 0) {
    if (behindCount < 1 && aheadCount < 1) {
      labels.push((
        <Label
          key="uptodate"
          content="up-to-date"
          color="teal"
          size="small"
        />
      ));
    }
  }
  if (aheadCount > 0) {
    labels.push((
      <Label
        key="ahead"
        content="ahead"
        color="violet"
        size="small"
      />
    ));
  }
  if (behindCount > 0) {
    labels.push((
      <Label
        key="behind"
        content="behind"
        color="purple"
        size="small"
      />
    ));
  }
  if (cleanCount < projectCount) {
    labels.push((
      <Label
        key="dirty"
        content="dirty"
        color="pink"
        size="small"
      />
    ));
  }

  return (
    <Card className="WorkspaceCard">
      <Card.Content>
        <Link
          to={`/workspaces/${slug}`}
          Component={Card.Header}
        >
          {name}
        </Link>
        {labels}
        <Card.Description>{description}</Card.Description>
        <Header as="h5">Repositories</Header>
        <Card.Description>
          <ProjectList items={projectNodes} />
        </Card.Description>
      </Card.Content>
      <Card.Content extra={true}>
        <div className="ui three buttons">
          <Link
            to={`/workspaces/${slug}`}
            className="ui teal button"
          >
            View
          </Link>
        </div>
      </Card.Content>
    </Card>
  );
}

export default createFragmentContainer(WorkspaceCard, graphql`
  fragment WorkspaceCard_item on Workspace {
    id
    slug
    name
    description
    projects {
      edges {
        node {
          isCloned,
          isCloning,
          isPulling,
          isBehind,
          isAhead,
          isClean,
          ...ProjectList_items
        }
      }
    }
  }`,
);
