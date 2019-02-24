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
  Button,
  Card,
  Divider,
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
      isCloned,
      isCloning,
      isPulling,
      isBehind,
      isAhead,
      isClean,
    },
    onClone,
    onPull,
  } = props;
  const labels: JSX.Element[] = [];
  const buttons: JSX.Element[] = [];
  const projectNodes = projects.edges.map(({ node }) => node);
  const handleClone = () => onClone({ ...props });
  const handlePull = () => onPull({ ...props });

  let color: "grey" | "teal" | "violet" | "purple" | "pink" = "grey";

  if (isCloned) {
    color = "teal";

    labels.push((
      <Label
        key="cloned"
        content="cloned"
        color="blue"
        size="small"
      />
    ));

    buttons.push((
      <Button
        key="pull"
        content="Pull"
        color="teal"
        icon="download"
        disabled={isPulling || !isBehind}
        loading={isPulling}
        onClick={handlePull}
      />
    ));

    if (!isBehind && !isAhead) {
      color = "teal";

      labels.push((
        <Label
          key="uptodate"
          content="up-to-date"
          color="teal"
          size="small"
        />
      ));
    }
  } else {
    buttons.push((
      <Button
        key="clone"
        content="Clone"
        color="teal"
        icon="clone"
        disabled={isCloning}
        loading={isCloning}
        onClick={handleClone}
      />
    ));
  }

  if (isAhead) {
    color = "violet";

    labels.push((
      <Label
        key="ahead"
        content="ahead"
        color="violet"
        size="small"
      />
    ));
  }

  if (isBehind) {
    color = "purple";

    labels.push((
      <Label
        key="behind"
        content="behind"
        color="purple"
        size="small"
      />
    ));
  }

  if (!isClean) {
    color = "pink";

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
    <Card
      className="WorkspaceCard"
      color={color}
    >
      <Card.Content>
        <Link
          to={`/workspaces/${slug}`}
          Component={Card.Header}
        >
          {name}
        </Link>
        {labels}
        <Card.Description>{description}</Card.Description>
        <Divider horizontal={true}>
          <Header as="h6">Repositories</Header>
        </Divider>
        <Card.Description>
          <ProjectList items={projectNodes} />
        </Card.Description>
      </Card.Content>
      <Card.Content extra={true}>
        <div className="ui three buttons">
          <Link
            to={`/workspaces/${slug}`}
            className="ui grey button"
          >
            Details
          </Link>
          {buttons}
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
    isCloned
    isCloning
    isPulling
    isBehind
    isAhead
    isClean
    projects {
      edges {
        node {
          ...ProjectList_items
        }
      }
    }
  }`,
);
