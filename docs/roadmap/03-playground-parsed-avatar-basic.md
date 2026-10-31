## Playground parsed: Avatar / Basic

The upstream playground presents HTML, JavaScript and React/TypeScript tabs backed by [sample.html](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Basic/sample.html), [main.js](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Basic/main.js) and [sample.tsx](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Basic/sample.tsx). The sample creates a React wrapper for the UI5 custom element and renders initials; this project should implement its own React component rather than assume the wrapper is the desired integration. The complete TypeScript playground sample is:

```tsx
import createReactComponent from "@ui5/webcomponents-base/dist/createReactComponent.js";
import AvatarClass from "@ui5/webcomponents/dist/Avatar.js";

const Avatar = createReactComponent(AvatarClass);

function App() {
  return <Avatar initials="FJ" />;
}

export default App;
```

