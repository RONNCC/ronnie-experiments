export default {
  id: "B",
  title: "Read a site",
  topic: "Deal & zoning basics",
  intro:
    "Draw the site twice: once as the law describes it, once as a building that actually fits. The smaller answer usually sets the next question.",
  lessons: [
    {
      id: "mix",
      title: "Count homes, then count rentable area",
      concept: "Unit mix",
      definition:
        "A dwelling unit is one home. Unit mix is the distribution of homes by type, such as studios and two-bedrooms. Gross building area includes circulation and shared areas; net rentable area counts space that can generate unit rent under the stated measurement convention.",
      why: "Two 100-unit plans can have different construction costs, rents and household markets. Lenders want the schedule of unit types and areas, not only the headline count.",
      example:
        "Ten 600-square-foot units give 6,000 rentable square feet. If the building is 7,500 gross square feet, its net-to-gross efficiency is 6,000 ÷ 7,500 = 80%. Applying unit rent per square foot to the corridors overstates income.",
      desk: "River North has 180 units in the supplied summary and 200 in the model. Neither source gives a unit mix in your brief. Ask for the dated unit schedule; do not infer smaller units or a redesign.",
      trap: "“Twenty more units means twenty identical rents at no extra cost.” Check unit sizes, common areas, costs and achievable rents together.",
      deeper:
        "A broker may quote rent per rentable square foot while a contractor quotes cost per gross square foot. Keep both denominators and their measurement standards. Multiplying the two rates by the same floor area hides real circulation, stairs and services.",
      terms: [
        ["Unit mix", "Counts by unit type, often with areas and rents."],
        [
          "Gross building area",
          "Floor area including common and service space under a stated standard.",
        ],
        [
          "Net rentable area",
          "Area used to calculate rent under the stated convention.",
        ],
      ],
      refs: [],
      apply: [
        "Which additional River North document explains the difference between area and unit count?",
        "A dated unit and area schedule tied to a plan set.",
        "The Opportunity Zone list.",
        "An assessor total with no measurement convention.",
        "Match areas and counts to the same design revision.",
      ],
      pitch: [
        "Why is unit count not enough for a rent projection?",
        "I need the mix and rentable areas to apply credible rents. A gross building area includes space the owner builds but cannot rent as apartments.",
      ],
    },
    {
      id: "density",
      title: "Turn acres into a screening count",
      concept: "Density",
      definition:
        "Dwelling units per acre (DU/acre) is a unit count divided by the site acreage specified in the code. A density ceiling is an arithmetic limit, not a site plan.",
      why: "A minimum-unit filter is useful for discarding unlikely candidates. A developer still has to fit the units, satisfy use rules and obtain approvals.",
      example:
        "At an illustrative maximum of 40 DU/acre, 1.5 qualifying acres × 40 gives a 60-unit ceiling. A Min units filter set to 50 can keep this candidate; it has not proved 50 units fit.",
      desk: "Keep the field, acreage basis and research vintage behind the filter. When density is missing or the allowed use is unknown, distinguish unknown from zero and from a verified pass.",
      trap: "“The parcel is two acres on the county map, so all two acres count.” Gross and net site acreage, rounding and deductions depend on the local rule.",
      deeper:
        "Run the calculation in reverse in a meeting: 80 desired units ÷ 40 DU/acre needs at least two qualifying acres before considering the envelope. If a constraint removes half an acre, recalculate using the right denominator rather than “rounding up” the parcel.",
      terms: [
        ["DU/acre", "Dwelling units per acre; state which acreage counts."],
        [
          "Density ceiling",
          "The maximum unit count implied by a density rule before other constraints.",
        ],
      ],
      refs: ["local"],
      apply: [
        "A 1.5-acre parcel at 40 DU/acre appears in the Min units 50 search. What do you call it?",
        "A candidate with a theoretical 60-unit density ceiling.",
        "An entitled 60-unit project.",
        "A guaranteed 50-unit construction loan.",
        "A density screen does not test floor area, setbacks or discretionary review.",
      ],
      pitch: [
        "Why put a theoretical number in the search at all?",
        "It tells us where to spend design time. I show which acreage and density produced the screen, then ask a planner and designer what fits.",
      ],
    },
    {
      id: "envelope",
      title: "Find the constraint that binds",
      concept: "The building envelope",
      definition:
        "Floor area ratio (FAR) is counted floor area divided by lot area. Setbacks reserve space from lot edges; lot coverage limits footprint; height limits vertical extent. Minimum lot size asks whether the qualifying lot area meets a local minimum; it is not necessarily a per-unit density rule. Together they shape the buildable envelope.",
      why: "The largest FAR on paper is not always usable. An architect must satisfy overlapping rules simultaneously, including how the local code counts floors, parking and open space.",
      example:
        "On a 10,000-square-foot lot, FAR 2.0 permits up to 20,000 counted square feet. A 50% coverage limit allows a 5,000-square-foot footprint. If only three such floors fit, the gross stack is 15,000 before any further deductions.",
      desk: "Show WAZA’s native code, maximum FAR, height, density and minimum lot size, with missing fields visible. Do not turn one published maximum into an as-of-right promise.",
      trap: "“FAR 2 means two storeys.” A one-storey building covering all of a lot and a two-storey building covering half each have FAR 1.0 if all floor area counts.",
      deeper:
        "A setback is a geometric cut; coverage is an area limit. One can bind even if the other has slack. Check the official code’s definitions and exceptions and request a test fit. Do not assume a height in feet always converts to the same floor count.",
      terms: [
        [
          "FAR",
          "Floor area ratio; counted floor area divided by qualifying lot area.",
        ],
        ["Setback", "Required separation from a lot line or other feature."],
        ["Lot coverage", "Share of lot area covered by the counted footprint."],
        [
          "Height limit",
          "Maximum height measured from a locally defined reference point.",
        ],
      ],
      refs: ["local"],
      apply: [
        "On the example lot, which is the tighter cap under the three-floor assumption?",
        "15,000 square feet from the footprint and floors.",
        "20,000 square feet just because the FAR permits it.",
        "30,000 square feet because there are three floors.",
        "Use the constraint that binds, not the largest published number.",
      ],
      pitch: [
        "Why show more than one zoning field?",
        "A density limit counts homes and FAR counts floor area. I need the footprint and height as well before treating either as buildable capacity.",
      ],
    },
    {
      id: "permission",
      title: "Read the permission, not the color",
      concept: "Use permission",
      definition:
        "By-right use can proceed under applicable objective rules without a discretionary use decision; it still needs required permits. Conditional use needs additional approval against criteria, often discretionary. A discretionary decision involves judgment by the authorized official or body.",
      why: "The approval route changes carrying cost, timing and the probability of closing. A permitted use is not the same as an issued permit for a particular plan.",
      example:
        "Two 40-unit proposals have the same rents. If one needs six extra months of review at an illustrative $10,000 monthly carrying cost, that is $60,000 before considering denial risk.",
      desk: "In the atlas P means permitted, C conditional, X not permitted for the specified use. Keep this separate from the four broad map classes; commercial/mixed-use is not a blanket multifamily permission.",
      trap: "“C means approved with standard conditions.” It means a conditional path to evaluate, not an approval already granted.",
      deeper:
        "Ask the planner for the applicable use table, footnotes, thresholds, decision maker, appeal periods and conditions. A rezoning is a change of the underlying rule or map, not the same as applying for a conditional use under the existing rule. [VERIFY] The local ordinance controls the procedure.",
      terms: [
        [
          "By right",
          "Allowed under applicable standards without a discretionary use decision; permits may still be required.",
        ],
        [
          "Conditional use",
          "A use requiring additional review against specified criteria.",
        ],
        [
          "Rezoning",
          "Changing a zoning classification or map through the applicable process.",
        ],
      ],
      refs: ["local"],
      apply: [
        "A zone is grouped as multifamily but the use field says C. What should the screen communicate?",
        "A conditional review path; verify the use table and footnotes.",
        "Approval is automatic once the site is purchased.",
        "All permits already exist.",
        "The coarse class is for search. Use-specific permissions and the official ordinance control the next check.",
      ],
      pitch: [
        "Why not color conditional and permitted sites the same way in an underwriting memo?",
        "They may look similar on a search map but need different approvals. The extra discretion can change schedule, cost and the decision to close.",
      ],
    },
    {
      id: "overlay",
      title: "A second layer can change the answer",
      concept: "Zoning overlays",
      definition:
        "A regulatory overlay adds rules to the base zoning for a mapped area. A map overlay in software is simply another visual layer; not every displayed layer is a zoning rule. A legal nonconforming use is a lawfully established use that no longer conforms to current rules.",
      why: "Existing buildings and neighboring projects are clues, not permission to build the same thing. A flood, historic or other local overlay may change what review is needed.",
      example:
        "A neighboring building has 12 apartments where today’s base zone appears to allow fewer. It could have an earlier lawful approval. Its existence alone establishes no right to repeat or expand it.",
      desk: "Parcels, OZ tracts and zoning can be shown together, but they answer “which land?”, “which tax geography?” and “which land-use rules?” respectively. A tax overlay cannot change use permission.",
      trap: "“Grandfathered means I can demolish and replace it like for like.” Continuation, abandonment, reconstruction and expansion rules vary.",
      deeper:
        "Get the record of lawful establishment, current ordinance and overlay boundaries. [VERIFY] Ask the planning authority for the treatment of the proposed work. Record the date and scope of its answer rather than treating an informal comment as a permit.",
      terms: [
        [
          "Overlay",
          "An additional mapped layer; a regulatory overlay may impose rules on top of the base zone.",
        ],
        [
          "Nonconforming use",
          "Lawfully established use that no longer conforms; continuation rights depend on local law.",
        ],
      ],
      refs: ["local"],
      apply: [
        "A site lies in an OZ and the base use table says X for apartments. Does the OZ change that?",
        "No. Tax geography does not amend the zoning use table.",
        "Yes, if the buyer holds for ten years.",
        "Yes, if the existing neighbor is multifamily.",
        "Each layer has a different authority and purpose.",
      ],
      pitch: [
        "How can two accurate map layers give different answers?",
        "They answer different questions. I check each layer against the decision it was meant to support, then verify the controlling rule.",
      ],
    },
  ],
};
