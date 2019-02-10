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
import React, { Component } from "react";
import { createFragmentContainer } from "react-relay";
import {
  Button,
  Card,
  Dimmer,
  Divider,
  Header,
  Label,
  Loader,
 } from "semantic-ui-react";

import { ProjectCard_item } from "./__generated__/ProjectCard_item.graphql";

import CommitFeed from "./CommitFeed";
import RepositoryShortName from "./RepositoryShortName";

import "./ProjectCard.css";

export interface IProps {
  item: ProjectCard_item;
  onClone: () => any;
  onPull: () => any;
}

export class ProjectCard extends Component<IProps> {

  public render() {
    const item = this.props.item;
    const commits = item.commits.edges.map(({ node }) => node);
    const labels: JSX.Element[] = [];
    const buttons: JSX.Element[] = [];

    let color: "grey" | "teal" | "pink" | "purple" = "grey";

    if (item.isCloned) {
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
          disabled={item.isPulling || !item.isBehind}
          loading={item.isPulling}
          onClick={this.props.onPull}
        />
      ));

      if (!item.isBehind && !item.isAhead) {
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
          disabled={item.isCloning}
          loading={item.isCloning}
          onClick={this.props.onClone}
        />
      ));
    }

    if (item.isAhead) {
      color = "purple";

      labels.push((
        <Label
          key="ahead"
          content="ahead"
          color="purple"
          size="small"
        />
      ));
    }

    if (item.isBehind) {
      color = "pink";

      labels.push((
        <Label
          key="behind"
          content="behind"
          color="pink"
          size="small"
        />
      ));
    }

    return (
      <Card
        className="ProjectCard"
        color={color}
      >
        <Dimmer
          active={item.commits.edges.length < 1}
          inverted={true}
        >
          <Loader content="Loading project commits..." />
        </Dimmer>
        <Card.Content>
          <Card.Header>
            <RepositoryShortName repository={item.repository} />
          </Card.Header>
          <Label size="small">{item.branch}</Label>
          {labels}
          <Card.Description>
            {item.description || "No description."}
          </Card.Description>
          <Divider horizontal={true}>
            <Header as="h6">Latest Commits</Header>
          </Divider>
          <CommitFeed items={commits} />
        </Card.Content>
        <Card.Content extra={true}>
          <div className="ui three buttons">
            {buttons}
          </div>
        </Card.Content>
      </Card>
    );
  }

}

export default createFragmentContainer(ProjectCard, graphql`
  fragment ProjectCard_item on Project
    @argumentDefinitions(
      commitsLimit: { type: "Int", defaultValue: 3 },
    ) {
    id
    repository
    branch
    description
    isCloning
    isCloned
    isPulling
    isBehind
    isAhead
    commits(first: $commitsLimit) {
      edges {
        node {
          ...CommitFeed_items
        }
      }
    }
  }`,
);
