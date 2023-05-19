from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Callable, Generic, Hashable, Optional, TypeVar

from typing_extensions import ParamSpec

from phoenix.core.model_schema import Model
from phoenix.server.api.input_types.DataSelector import DataSelector

_Steps = ParamSpec("_Steps")
_Parameters = TypeVar("_Parameters", bound=Hashable)
_Input = TypeVar("_Input")
_Output = TypeVar("_Output", covariant=True)


@dataclass(frozen=True)
class Step(Generic[_Parameters, _Input, _Output]):
    parameters: _Parameters

    @abstractmethod
    def __call__(self, x: _Input) -> _Output:
        ...


@dataclass(frozen=True)
class JustPipeline(Generic[_Input, _Steps, _Output]):
    steps: _Steps.args

    def __init__(
        self,
        *steps: _Steps.args,
        **_: _Steps.kwargs,
    ) -> None:
        object.__setattr__(self, "steps", steps)


@dataclass(frozen=True)
class Pipeline(Generic[_Input, _Steps, _Output]):
    steps: _Steps.args
    execute: Callable[[_Input], _Output]

    def __init__(
        self,
        *steps: _Steps.args,
        **_: _Steps.kwargs,
    ) -> None:
        object.__setattr__(self, "steps", steps)

    def __call__(
        self,
        data: Any,
        start: Optional[int] = None,
        stop: Optional[int] = None,
    ) -> Any:
        ans: Any = data
        for step in self.steps[slice(start, stop)]:
            ans = step(ans)
        return ans


@dataclass(frozen=True)
class DataCollector(
    Step[DataSelector, Model, _Output],
    Generic[_Output],
    ABC,
):
    ...
