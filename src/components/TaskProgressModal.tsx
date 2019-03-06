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
import { Button, Modal } from "semantic-ui-react";

import { TaskProgressModal_item } from "./__generated__/TaskProgressModal_item.graphql";

import TaskProgress from "./TaskProgress";

export interface IProps {
  item: TaskProgressModal_item;
  onClose: (values: IProps) => any;
}

export function TaskProgressModal(props: IProps) {
  const {
    item,
    item: { name },
    onClose
  } = props;
  const handleClose = () => onClose({ ...props });

  return (
    <Modal open={true} onClose={handleClose}>
      <Modal.Header>Running {name}</Modal.Header>
      <Modal.Content scrolling={true}>
        <TaskProgress item={item} />
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={handleClose}>Close</Button>
      </Modal.Actions>
    </Modal>
  );
}

export default createFragmentContainer(
  TaskProgressModal,
  graphql`
    fragment TaskProgressModal_item on Task {
      name
      ...TaskProgress_item
    }
  `
);
