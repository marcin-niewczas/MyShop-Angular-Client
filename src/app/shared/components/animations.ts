import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const inOutAnimation = trigger('inOutTrigger', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('.2s', style({ opacity: 1 })),
  ]),
  transition(':leave', [animate('.2s', style({ opacity: 0 }))]),
]);

export const inAnimation = trigger('inTrigger', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('.4s', style({ opacity: 1 })),
  ]),
]);

export const outAnimation = trigger('outTrigger', [
  transition(':leave', [
    animate('.6s ease', style({ opacity: 1 })),
    animate('.4s ease', style({ opacity: 0 })),
  ]),
]);

export const fadeOutAnimation = trigger('fadeOutTrigger', [
  transition(':leave', [animate('.4s ease', style({ opacity: 0 }))]),
]);

export const slideFromRightAnimation = trigger('slideFromRightTrigger', [
  transition(':enter', [
    style({ transform: 'translateX(100%)' }),
    animate('.4s ease', style({ transform: 'translateX(0%)' })),
  ]),
  transition(':leave', [
    animate('.2s ease', style({ transform: 'translateX(100%)' })),
  ]),
]);

export const slideFromLeftAnimation = trigger('slideFromLeftTrigger', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('.6s ease', style({ transform: 'translateX(0%)' })),
  ]),
  transition(':leave', [
    animate('.2s ease', style({ transform: 'translateX(100%)' })),
  ]),
]);

export const slideFromLeftLeaveToLeftAnimation = trigger(
  'slideFromLeftLeaveToLeftTrigger',
  [
    transition(':enter', [
      style({ transform: 'translateX(-100%)' }),
      animate('.5s ease', style({ transform: 'translateX(0%)' })),
    ]),
    transition(':leave', [
      animate('.3s ease', style({ transform: 'translateX(-100%)' })),
    ]),
  ],
);

export const slideFromTopAnimation = trigger('slideFromTopTrigger', [
  transition(':enter', [
    style({ transform: 'translateY(-100%)' }),
    animate('.4s ease-in-out', style({ transform: 'translateY(0%)' })),
  ]),
  transition(':leave', [
    animate(
      '.4s ease-in-out',
      style({ transform: 'translateY(-100%)', opacity: 0 }),
    ),
  ]),
]);

export const slideFromRightLeaveNoAnimation = trigger(
  'slideFromRightLeaveNoTrigger',
  [
    transition(':enter', [
      style({ transform: 'translateX(100%)' }),
      animate('.5s ease', style({ transform: 'translateX(0%)' })),
    ]),
  ],
);

export const slideFromLeftLeaveNoAnimation = trigger(
  'slideFromLeftLeaveNoTrigger',
  [
    transition(':enter', [
      style({ transform: 'translateX(-100%)' }),
      animate('.5s ease', style({ transform: 'translateX(0%)' })),
    ]),
  ],
);

export const fadeInOutAnimation = trigger('fadeInOutAnimation', [
  state('visible', style({ opacity: 1 })),
  state('hidden', style({ opacity: 0 })),
  transition('hidden => visible', animate('.2s ease-in')),
  transition('visible => hidden', animate('.2s ease-out')),
]);

export const rotateIconAnimation = trigger('rotateIcon', [
  state('true', style({ transform: 'rotate(-180deg)' })),
  state('false', style({ transform: 'rotate(0deg)' })),
  transition('true <=> false', animate('0.2s ease-in-out')),
]);

export const expandCollapseAnimation = trigger('expandCollapse', [
  state('expanded', style({ height: '*' })),
  state('collapsed', style({ height: '0' })),
  transition('expanded <=> collapsed', animate('.2s ease-in-out')),
]);

export const expandCollapseWidthAnimation = trigger('expandCollapseWidth', [
  state(
    'expanded',
    style({ transform: 'translateX(0)', maxWidth: '*', minWidth: '*' }),
  ),
  state(
    'collapsed',
    style({ transform: 'translateX(-150%)', maxWidth: '0', minWidth: '0' }),
  ),
  transition('expanded <=> collapsed', animate('.3s ease-in-out')),
]);

export const skipFirstAnimation = trigger('skipFirstTrigger', [
  transition(':enter', [])
]);

export const expandTransitionAnimation = trigger('expandTransitionTrigger', [
  transition(':enter', [
    style({ height: 0 }),
    animate('.3s ease', style({ height: '*' })),
  ]),
  transition(':leave', animate('.3s ease', style({ height: 0 }))),
]);
