/**
 * One inhabitant per ocean layer, drawn as a flat silhouette in
 * currentColor and drifting slowly behind its zone.
 *
 * Deliberately simple: these read as ambient shapes at low opacity, not
 * as illustration. If real artwork ever arrives, only this file changes.
 */

export type CreatureName =
  | "otter"
  | "turtle"
  | "dolphin"
  | "squid"
  | "lanternfish"
  | "anglerfish"
  | "dumbo";

const shapes: Record<CreatureName, React.ReactNode> = {
  // sea otter, floating on its back at the tide line
  otter: (
    <>
      <ellipse cx="95" cy="64" rx="58" ry="20" />
      <path d="M42,64 C24,60 13,68 3,75 C15,78 30,75 42,70 Z" />
      <circle cx="158" cy="50" r="18" />
      <circle cx="149" cy="35" r="6" />
      <circle cx="167" cy="34" r="6" />
      <ellipse cx="173" cy="56" rx="9" ry="7" />
      <circle cx="112" cy="41" r="8" />
      <circle cx="130" cy="39" r="8" />
    </>
  ),

  // green turtle over the reef, seen from above
  turtle: (
    <>
      <ellipse cx="98" cy="60" rx="44" ry="33" />
      <ellipse cx="150" cy="60" rx="15" ry="12" />
      <ellipse cx="130" cy="28" rx="23" ry="9" transform="rotate(-34 130 28)" />
      <ellipse cx="130" cy="92" rx="23" ry="9" transform="rotate(34 130 92)" />
      <ellipse cx="62" cy="32" rx="17" ry="8" transform="rotate(32 62 32)" />
      <ellipse cx="62" cy="88" rx="17" ry="8" transform="rotate(-32 62 88)" />
      <ellipse cx="56" cy="60" rx="9" ry="6" />
    </>
  ),

  // dolphin in the sunlit water
  dolphin: (
    <>
      <path d="M22,66 C46,36 94,26 142,34 C162,38 178,48 194,58 C178,65 160,73 142,79 C94,91 46,84 22,66 Z" />
      <path d="M96,32 L114,6 L126,35 Z" />
      <path d="M92,76 L82,100 L110,82 Z" />
      <path d="M22,66 L2,44 L11,66 L2,90 Z" />
    </>
  ),

  // squid in the twilight zone
  squid: (
    <>
      <path d="M100,4 C120,4 131,26 128,54 L72,54 C69,26 80,4 100,4 Z" />
      <path d="M127,24 L156,8 L130,48 Z" />
      <path d="M73,24 L44,8 L70,48 Z" />
      <ellipse cx="100" cy="60" rx="27" ry="13" />
      <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
        <path d="M82,70 C74,88 80,104 70,118" />
        <path d="M91,72 C86,92 91,106 85,118" />
        <path d="M100,72 C100,94 98,106 100,118" />
        <path d="M109,72 C114,92 109,106 115,118" />
        <path d="M118,70 C126,88 120,104 130,118" />
      </g>
    </>
  ),

  /**
   * Lanternfish of the deep scattering layer. Interior detail is
   * invisible in a single-colour silhouette, so every light sits outside
   * the body: bumps along the belly and loose motes in the water around
   * it. That scatter IS the zone — a band so thick with small lights
   * that sonar reads it as a false sea floor.
   */
  lanternfish: (
    <>
      <path d="M40,62 C52,40 78,28 108,26 C146,24 176,38 182,62 C176,86 146,100 108,98 C78,96 52,84 40,62 Z" />
      <path d="M40,62 L8,40 L18,62 L8,84 Z" />
      <path d="M96,28 L108,8 L124,32 Z" />
      <path d="M56,44 L64,32 L70,47 Z" />
      <path d="M84,94 L92,110 L106,92 Z" />
      <g className="photophores">
        <circle cx="66" cy="88" r="3.4" />
        <circle cx="88" cy="97" r="3.4" />
        <circle cx="110" cy="101" r="3.4" />
        <circle cx="132" cy="97" r="3.4" />
        <circle cx="152" cy="88" r="3.4" />
        <circle cx="18" cy="26" r="2.6" />
        <circle cx="70" cy="13" r="2.4" />
        <circle cx="168" cy="16" r="2.2" />
        <circle cx="196" cy="44" r="2.2" />
        <circle cx="186" cy="98" r="2.6" />
        <circle cx="146" cy="114" r="2.2" />
        <circle cx="96" cy="120" r="2" />
        <circle cx="30" cy="102" r="2.4" />
        <circle cx="9" cy="60" r="1.9" />
      </g>
    </>
  ),

  // anglerfish, where the only light is the light you bring
  anglerfish: (
    <>
      <ellipse cx="92" cy="68" rx="52" ry="35" />
      <path d="M40,68 L12,42 L21,68 L12,94 Z" />
      <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
        <path d="M98,34 C94,10 124,2 141,16" />
      </g>
      <circle cx="145" cy="19" r="8" />
      <path d="M104,86 L112,98 L120,86 L128,96 L136,84 Z" />
    </>
  ),

  // dumbo octopus on the floor
  dumbo: (
    <>
      <path d="M100,18 C133,18 153,45 150,70 C132,82 68,82 50,70 C47,45 67,18 100,18 Z" />
      <ellipse cx="40" cy="38" rx="21" ry="10" transform="rotate(-26 40 38)" />
      <ellipse cx="160" cy="38" rx="21" ry="10" transform="rotate(26 160 38)" />
      <path d="M54,72 C58,96 76,110 100,110 C124,110 142,96 146,72 Z" />
      <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
        <path d="M74,108 C70,116 66,119 60,120" />
        <path d="M100,110 C100,116 100,118 100,121" />
        <path d="M126,108 C130,116 134,119 140,120" />
      </g>
    </>
  ),
};

export function Creature({ name }: { name: CreatureName }) {
  return (
    <svg
      className="creature"
      data-creature={name}
      viewBox="0 0 200 124"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {shapes[name]}
    </svg>
  );
}
