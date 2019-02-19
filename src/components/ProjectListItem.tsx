import graphql from "babel-plugin-relay/macro";
import React from "react";
import { createFragmentContainer } from "react-relay";
import {
  Label,
  List,
} from "semantic-ui-react";

import { ProjectListItem_item } from "./__generated__/ProjectListItem_item.graphql";

import RepositoryShortName from "./RepositoryShortName";

import "./ProjectListItem.css";

export interface IProps {
  item: ProjectListItem_item;
}

export function ProjectListItem({
  item: {
    localReferenceShort,
    repository,
    remoteReferenceShort,
  },
}: IProps) {
  const reference = remoteReferenceShort === localReferenceShort ?
    remoteReferenceShort : `${localReferenceShort} » ${remoteReferenceShort}`;

  return (
    <List.Item className="ProjectListItem">
      <List.Content floated="right">
        <Label size="small">{reference}</Label>
      </List.Content>
      <List.Content>
        <RepositoryShortName repository={repository} />
      </List.Content>
    </List.Item>
  );
}

export default createFragmentContainer(ProjectListItem, graphql`
  fragment ProjectListItem_item on Project {
    repository
    remoteReferenceShort
    localReferenceShort
  }`,
);
