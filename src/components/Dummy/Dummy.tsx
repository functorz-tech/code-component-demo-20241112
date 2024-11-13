import { useState, useEffect, useCallback } from 'react';
import { EventHandler, State, useAppContext } from 'zvm-code-context';

export interface DummyPropData {
  dummyInput?: string
}

export interface DummyStateData {
  dummyOutput?: State<string>;
}

export interface DummyEvent {
  anEvent: EventHandler
}

export interface DummyProps {
  propData: DummyPropData;
  propState: DummyStateData;
  event: DummyEvent;
}

export function Dummy({ propData, propState, event }: DummyProps) {

  useEffect(() => {
    if (propData.dummyInput) {
      propState.dummyOutput?.set(propData.dummyInput);
    }
  }, [propData.dummyInput]);

  return <div onClick={() => event.anEvent.trigger()}>{propData.dummyInput}</div>;
}
