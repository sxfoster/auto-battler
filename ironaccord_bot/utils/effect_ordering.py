from __future__ import annotations

from graphlib import TopologicalSorter, CycleError
from typing import Any, Dict, Iterable, List

# Default partial ordering between effect types. Each key lists the effect
# types that must resolve *before* it.
DEFAULT_DEPENDENCIES: Dict[str, List[str]] = {
    "heal": ["damage"],
    "damage": ["buff", "debuff"],
}


def order_effects(
    effects: Iterable[Dict[str, Any]],
    dependencies: Dict[str, List[str]] | None = None,
) -> List[Dict[str, Any]]:
    """Order effects using a partial type hierarchy.

    Parameters
    ----------
    effects:
        Iterable of effect dictionaries containing at least a ``"type"`` key.
    dependencies:
        Mapping of effect type to a list of types that should resolve first.
        If ``None``, :data:`DEFAULT_DEPENDENCIES` is used.

    Returns
    -------
    List[Dict[str, Any]]
        Effects ordered according to the partial ordering. Types not present
        in the dependency mapping keep their original order relative to each
        other and appear after the ordered groups.
    """

    deps = dependencies or DEFAULT_DEPENDENCIES
    # Determine the effect types that are part of the ordering graph
    ordered_types = set(deps)
    effect_types = [e.get("type") for e in effects]
    ordered_effects: List[Dict[str, Any]] = []

    graph = {t: deps.get(t, []) for t in ordered_types}

    try:
        ts = TopologicalSorter(graph)
        type_order = list(ts.static_order())
    except CycleError as exc:  # pragma: no cover - safety net
        raise ValueError("Cyclic dependency detected in effect hierarchy") from exc

    buckets = {t: [] for t in type_order}
    others: List[Dict[str, Any]] = []

    for eff in effects:
        t = eff.get("type")
        if t in buckets:
            buckets[t].append(eff)
        else:
            others.append(eff)

    for t in type_order:
        ordered_effects.extend(buckets[t])
    ordered_effects.extend(others)

    return ordered_effects
