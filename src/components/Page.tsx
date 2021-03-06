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

import React from "react";
import Helmet from "react-helmet";
import { Container, Header } from "semantic-ui-react";

import "./Page.css";

export interface IProps {
  className?: string;
  header: string;
  subheader: string;
  children: React.ReactNode;
  inverted?: boolean;
  text?: boolean;
}

const Page = ({
  className,
  inverted,
  header,
  subheader,
  text,
  children
}: IProps) => (
  <div className={`Page ${className || ""}`}>
    <Helmet>
      <title>{header}</title>
      <body className={inverted ? "inverted" : ""} />
    </Helmet>
    <Container fluid={true} text={text}>
      <Header as="h1" inverted={inverted}>
        <Header.Content>
          {header}
          <Header.Subheader>{subheader}</Header.Subheader>
        </Header.Content>
      </Header>
      {children}
    </Container>
  </div>
);

export default Page;
