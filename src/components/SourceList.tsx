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
import { List } from "semantic-ui-react";

import { SourceList_items } from "./__generated__/SourceList_items.graphql";

import DirectorySourceListItem, {
  IProps as IDirectorySourceListItemProps
} from "./DirectorySourceListItem";
import GitSourceListItem, {
  IProps as IGitSourceListItemProps
} from "./GitSourceListItem";

export interface IProps {
  items: SourceList_items;
  onDeleteDirectorySource: (values: IDirectorySourceListItemProps) => any;
  onDeleteGitSource: (values: IGitSourceListItemProps) => any;
}

export function SourceList({
  items,
  onDeleteDirectorySource,
  onDeleteGitSource
}: IProps) {
  if (items.length < 1) {
    return <p>There are no sources at this time.</p>;
  }

  const listItems = items.map(item => {
    switch (item.__typename) {
      case "DirectorySource":
        return (
          <DirectorySourceListItem
            key={item.id}
            item={item}
            onDelete={onDeleteDirectorySource}
          />
        );
      case "GitSource":
        return (
          <GitSourceListItem
            key={item.id}
            item={item}
            onDelete={onDeleteGitSource}
          />
        );
    }
    return null;
  });

  return (
    <List size="large" divided={true}>
      {listItems}
    </List>
  );
}

export default createFragmentContainer(
  SourceList,
  graphql`
    fragment SourceList_items on Source @relay(plural: true) {
      __typename
      id
      ... on DirectorySource {
        ...DirectorySourceListItem_item
      }
      ... on GitSource {
        ...GitSourceListItem_item
      }
    }
  `
);
