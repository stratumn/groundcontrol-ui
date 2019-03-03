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
  Card,
  Dimmer,
  Label,
  Loader,
  Tab,
 } from "semantic-ui-react";

import { ProjectCard_item } from "./__generated__/ProjectCard_item.graphql";

import CommitFeed from "./CommitFeed";
import RepositoryShortName from "./RepositoryShortName";

import "./ProjectCard.css";

export interface IProps {
  item: ProjectCard_item;
  onClone: (values: IProps) => any;
  onClickPath: (values: IProps) => any;
  onPull: (values: IProps) => any;
}

export function ProjectCard(props: IProps) {
  const {
    item,
    item: {
      repository,
      remoteReferenceShort,
      description,
      path,
      shortPath,
      remoteCommits,
      isCloned,
      isCloning,
      isPulling,
      isAhead,
      isBehind,
      isClean,
      localReferenceShort,
    },
    onClickPath,
    onClone,
    onPull,
  } = props;
  const remoteCommitNodes = item.remoteCommits.edges.map(({ node }) => node);
  const localCommitNodes = item.localCommits.edges.map(({ node }) => node);
  const handleClickPath = () => onClickPath({ ...props });
  const handleClone = () => onClone({ ...props });
  const handlePull = () => onPull({ ...props });
  const reference = remoteReferenceShort === localReferenceShort ?
    remoteReferenceShort : `${localReferenceShort} » ${remoteReferenceShort}`;
  const labels: JSX.Element[] = [];
  const buttons: JSX.Element[] = [];
  const menuProps = {
    size: "tiny",
    tabular: true,
  };
  const panes = [{
    menuItem: "Remote",
    render: () => <CommitFeed items={remoteCommitNodes} />,
  }];

  if (isCloned) {
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
      labels.push((
        <Label
          key="uptodate"
          content="up-to-date"
          color="teal"
          size="small"
        />
      ));
    }

    panes.push({
      menuItem: "Local",
      render: () => <CommitFeed items={localCommitNodes} />,
    });
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
    labels.push((
      <Label
        key="dirty"
        content="dirty"
        color="pink"
        size="small"
      />
    ));
  }

  let meta: JSX.Element | null = null;

  if (isCloned) {
    meta = (
      <Card.Meta
        as="a"
        href={`file://${path}`}
        onClick={handleClickPath}
      >
        {shortPath}
      </Card.Meta>
    );
  }

  return (
    <Card className="ProjectCard">
      <Card.Content>
        <Card.Header>
          <RepositoryShortName repository={repository} />
        </Card.Header>
        {meta}
        <Label
          size="small"
          color="grey"
        >
          {reference}
        </Label>
        {labels}
        <Card.Description>
          {description || "No description."}
        </Card.Description>
        <Tab
          panes={panes}
          menu={menuProps}
        />
      </Card.Content>
      <Card.Content extra={true}>
        <div className="ui three buttons">
          {buttons}
        </div>
      </Card.Content>
      <Dimmer
        active={remoteCommits.edges.length < 1}
        inverted={true}
      >
        <Loader content="Loading project commits..." />
      </Dimmer>
    </Card>
  );
}

export default createFragmentContainer(ProjectCard, graphql`
  fragment ProjectCard_item on Project
    @argumentDefinitions(
      commitsLimit: { type: "Int", defaultValue: 3 },
    ) {
    id
    repository
    remoteReferenceShort
    localReferenceShort
    description
    path
    shortPath
    isCloning
    isCloned
    isPulling
    isBehind
    isAhead
    isClean
    remoteCommits(first: $commitsLimit) {
      edges {
        node {
          ...CommitFeed_items
        }
      }
    }
    localCommits(first: $commitsLimit) {
      edges {
        node {
          ...CommitFeed_items
        }
      }
    }
  }`,
);
