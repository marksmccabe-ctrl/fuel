// Turns rule results into node:test subtests: a pass passes, a fail fails with the plain-words message, a judgment call is a TODO
// (shown in the output, never failing the run), and a warned shortfall passes with a note.
// A failure is the plain-words message only (ride, expected vs actual, rule): no stack trace to wade through.
const fail = msg => { const e = new Error(msg); e.stack = msg; throw e; };

export async function reportChecks(t, checks) {
  for (const c of checks) {
    const name = `${c.id} · ${c.title}${c.msg && c.status === 'pass' ? ` (${c.msg})` : ''}`;
    if (c.status === 'pass') await t.test(name, () => {});
    else if (c.status === 'fail') await t.test(name, () => fail(c.msg));
    else if (c.status === 'judgment') await t.test(`${name} [${c.j}: for Mark]`, { todo: c.msg }, () => fail(c.msg));
    else if (c.status === 'warned') await t.test(`${name} [warned on screen]`, s => s.diagnostic(c.msg));
  }
}

// Random runs: one test per rule; the failures are listed (first few in full) with how many of the rides broke it.
export async function reportAggregate(t, byRule, n) {
  for (const [id, g] of Object.entries(byRule)) {
    const title = `${id} · ${g.title}`;
    const ex = list => list.slice(0, 4).map(m => '  - ' + m).join('\n');
    if (g.fail.length) await t.test(title, () => fail(`${g.fail.length} of ${n} random rides break this rule. First ones:\n${ex(g.fail)}`));
    else await t.test(`${title} (${g.pass} of ${n} rides checked)`, () => {});
    for (const [j, list] of Object.entries(g.judgment)) await t.test(`${title} [${j}: for Mark, ${list.length} rides]`, { todo: `${list.length} rides; e.g.\n${ex(list)}` }, () => fail(list[0]));
    if (g.warned.length) await t.test(`${title} [warned on screen: ${g.warned.length} rides]`, s => s.diagnostic(ex(g.warned)));
  }
}
