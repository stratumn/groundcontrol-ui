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
import { requestSubscription } from "react-relay";
import { ConnectionHandler, Environment } from "relay-runtime";

const subscription = graphql`
  subscription logEntryAddedSubscription($lastMessageId: ID) {
    logEntryAdded(lastMessageId: $lastMessageId) {
      ...LogEntryTable_items
    }
  }
`;

export function subscribe(
  environment: Environment,
  getLevel: () => string[] | undefined,
  getOwnerId: () => string | undefined,
  lastMessageId?: string,
) {
  return requestSubscription(
    environment,
    {
      onError: (error) => console.error(error),
      subscription,
      updater: (store) => {
        const record = store.getRootField("logEntryAdded")!;
        const recordId = record.getValue("id");
        const system = store.getRoot().getLinkedRecord("system");
        const newLevel = record!.getValue("level");
        const owner = record.getLinkedRecord("owner");
        const newOwnerId = owner ? owner.getValue("id") : undefined;
        const level = getLevel();
        const ownerId = getOwnerId();

        const connection = ConnectionHandler.getConnection(
          system,
          "LogEntryListPage_logEntries",
          { level, ownerId },
        );

        if (!connection) {
          return;
        }

        let contains = true;

        if (level && level.indexOf(newLevel) < 0) {
          contains = false;
        }

        if (ownerId && ownerId !== newOwnerId) {
          contains = false;
        }

        if (!contains) {
          ConnectionHandler.deleteNode(connection, recordId);
          return;
        }

        const edges = connection.getLinkedRecords("edges");

        for (const e of edges) {
          const id = e.getLinkedRecord("node")!.getValue("id");

          if (recordId === id) {
            return;
          }
        }

        const edge = ConnectionHandler.createEdge(
          store,
          connection,
          record,
          "LogEntrysConnection",
        );
        ConnectionHandler.insertEdgeAfter(connection, edge);
    },
      variables: {
        lastMessageId,
      },
    },
  );
}
