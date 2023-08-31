/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ServerObject } from "@slashid/docusaurus-plugin-openapi-docs-slashid/src/openapi/types";
// TODO: we might want to export this

export interface State {
  value?: ServerObject;
  options: ServerObject[];
}

const initialState: State = {} as any;

export const slice = createSlice({
  name: "server",
  initialState,
  reducers: {
    setServer: (state, action: PayloadAction<string>) => {
      state.value = state.options.find((s) => s.url === action.payload);
    },
    setServerVariable: (
      state,
      action: PayloadAction<{ key: string; value: string }>
    ) => {
      if (state.value?.variables) {
        state.value.variables[action.payload.key].default =
          action.payload.value;
      }
    },
  },
});

export const { setServer, setServerVariable } = slice.actions;

export default slice.reducer;
