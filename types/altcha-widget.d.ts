import type { AltchaWidgetElement } from 'altcha';
import type { DetailedHTMLProps, HTMLAttributes, Ref } from 'react';

type AltchaWidgetProps = DetailedHTMLProps<
  HTMLAttributes<AltchaWidgetElement>,
  AltchaWidgetElement
> & {
  auto?: 'off' | 'onfocus' | 'onload' | 'onsubmit';
  challenge?: string;
  display?: 'standard' | 'bar' | 'floating' | 'overlay' | 'invisible';
  name?: string;
  ref?: Ref<AltchaWidgetElement>;
};

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'altcha-widget': AltchaWidgetProps;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'altcha-widget': AltchaWidgetProps;
    }
  }
}
