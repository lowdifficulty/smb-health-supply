(function (global) {
  var VALID_ROLES = ["md", "do", "rn"];
  var activeRole = "md";

  var CHECKLIST_DATA = [
    {
      category: "Business Entity",
      description: "Set up the legal and financial foundation for the practice.",
      descriptions: {
        md: "Set up the legal and financial foundation for your practice.",
        do: "Set up the legal and financial foundation for your practice.",
        rn: "Confirm the practice foundation is in place for your clinical role."
      },
      items: [
        { text: "Form medical practice entity", roles: ["md", "do"] },
        { text: "Get EIN", roles: ["md", "do"] },
        { text: "Open business bank account", roles: ["md", "do"] },
        { text: "Set business address", roles: ["md", "do"] },
        { text: "Get malpractice insurance", roles: ["md", "do"] },
        { text: "Confirm practice entity is established", roles: ["rn"] },
        { text: "Confirm malpractice coverage includes your nursing services", roles: ["rn"] }
      ]
    },
    {
      category: "Provider Setup",
      description: "Make sure the MD and NP providers are ready for payer enrollment.",
      descriptions: {
        md: "Make sure you and any NP staff are ready for payer enrollment.",
        do: "Make sure you and any NP staff are ready for payer enrollment.",
        rn: "Confirm your nursing credentials and physician collaboration are ready."
      },
      items: [
        { text: "Confirm MD/DO active medical license", roles: ["md", "do"] },
        { text: "Confirm MD/DO individual NPI", roles: ["md", "do"] },
        { text: "Confirm MD/DO CAQH profile", roles: ["md", "do"] },
        { text: "Confirm MD/DO PECOS access", roles: ["md", "do"] },
        { text: "Confirm NP active license", roles: ["md", "do"] },
        { text: "Confirm NP individual NPI", roles: ["md", "do"] },
        { text: "Confirm NP CAQH profile", roles: ["md", "do"] },
        { text: "Confirm NP PECOS access", roles: ["md", "do"] },
        { text: "Confirm NP supervision or collaboration agreement if required", roles: ["md", "do"] },
        { text: "Confirm RN active license", roles: ["rn"] },
        { text: "Confirm RN individual NPI", roles: ["rn"] },
        { text: "Confirm collaboration or supervision agreement with supervising physician", roles: ["rn"] },
        { text: "Confirm supervising physician active medical license", roles: ["rn"] },
        { text: "Confirm supervising physician individual NPI", roles: ["rn"] },
        { text: "Confirm supervising physician CAQH profile", roles: ["rn"] }
      ]
    },
    {
      category: "Insurance Credentialing",
      description: "Enroll the group and providers with the payers needed to see patients.",
      descriptions: {
        md: "Enroll your group and providers with the payers needed to see patients.",
        do: "Enroll your group and providers with the payers needed to see patients.",
        rn: "Confirm supervising physician and practice payer enrollment is complete."
      },
      items: [
        { text: "Get group NPI Type 2", roles: ["md", "do"] },
        { text: "Enroll group with Medicare", roles: ["md", "do"] },
        { text: "Reassign MD/DO benefits to group", roles: ["md", "do"] },
        { text: "Reassign NP benefits to group", roles: ["md", "do"] },
        { text: "Credential with Medicare Advantage plans", roles: ["md", "do"] },
        { text: "Credential with commercial payers", roles: ["md", "do"] },
        { text: "Track payer effective dates", roles: ["md", "do"] },
        { text: "Confirm group/practice NPI Type 2 is active", roles: ["rn"] },
        { text: "Confirm supervising physician is enrolled with Medicare", roles: ["rn"] },
        { text: "Confirm supervising physician is credentialed with Medicare Advantage plans", roles: ["rn"] },
        { text: "Confirm supervising physician is credentialed with commercial payers", roles: ["rn"] },
        { text: "Track payer effective dates for supervising physician", roles: ["rn"] }
      ]
    },
    {
      category: "Billing Setup",
      description: "Prepare the practice to submit claims and receive payment.",
      items: [
        "Choose outsourced billing company or in-house biller",
        "Set up clearinghouse",
        "Set up EFT",
        "Set up ERA",
        "Create basic wound care billing code list",
        "Confirm first-patient billing workflow"
      ]
    },
    {
      category: "EMR and Documentation",
      description: "Set up the tools and forms needed to document care properly.",
      items: [
        "Choose EMR",
        "Build first-visit wound care note template",
        "Enable wound photos",
        "Enable wound measurements",
        "Create consent to treat form",
        "Create HIPAA notice",
        "Create assignment of benefits form",
        "Create financial responsibility form",
        "Create wound photo consent form"
      ]
    },
    {
      category: "First Patient Readiness",
      description: "Confirm the practice is ready to schedule, verify, see, and bill the first patient.",
      descriptions: {
        md: "Confirm your practice is ready to schedule, verify, see, and bill the first patient.",
        do: "Confirm your practice is ready to schedule, verify, see, and bill the first patient.",
        rn: "Confirm you are ready to intake, see, and document your first wound care patient."
      },
      items: [
        "Collect patient demographics",
        "Collect insurance card",
        "Collect photo ID",
        "Collect referral if available",
        "Collect medical history",
        "Collect wound history",
        "Verify insurance coverage",
        { text: "Confirm provider is credentialed with patient payer", roles: ["md", "do"] },
        { text: "Confirm supervising physician is credentialed with patient payer", roles: ["rn"] },
        "Confirm prior authorization requirement",
        "Confirm place of service is covered",
        "Schedule first visit",
        "See first patient",
        { text: "Provider signs note", roles: ["md", "do"] },
        { text: "Collaborating physician signs note", roles: ["rn"] },
        { text: "Submit first claim", roles: ["md", "do"] },
        { text: "Submit first claim under supervising physician", roles: ["rn"] }
      ]
    }
  ];

  var ROLE_LABELS = {
    md: "MD",
    do: "DO",
    rn: "RN"
  };

  var ROLE_SUBTITLES = {
    md: "Your physician launch checklist to open a wound care practice and see your first patient.",
    do: "Your physician launch checklist to open a wound care practice and see your first patient.",
    rn: "Your nursing checklist to deliver wound care and see your first patient under physician collaboration."
  };

  function normalizeRole(role) {
    role = (role || "md").toLowerCase();
    return VALID_ROLES.indexOf(role) >= 0 ? role : "md";
  }

  function getItemText(item) {
    return typeof item === "string" ? item : item.text;
  }

  function itemAppliesToRole(item, role) {
    if (typeof item === "string") return true;
    if (!item.roles || !item.roles.length) return true;
    if (role === "do" && item.roles.indexOf("md") >= 0) return true;
    return item.roles.indexOf(role) >= 0;
  }

  function getChecklistForRole(role) {
    role = normalizeRole(role);
    return CHECKLIST_DATA.map(function (cat) {
      var items = cat.items
        .filter(function (item) { return itemAppliesToRole(item, role); })
        .map(getItemText);
      var description = (cat.descriptions && (cat.descriptions[role] || cat.descriptions.md)) || cat.description;
      return {
        category: cat.category,
        description: description,
        items: items
      };
    }).filter(function (cat) { return cat.items.length > 0; });
  }

  function setRole(role) {
    activeRole = normalizeRole(role);
    filteredData = getChecklistForRole(activeRole);
    global.CHECKLIST.data = filteredData;
  }

  var filteredData = getChecklistForRole(activeRole);

  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function generateItemId(category, item) {
    return slugify(category) + "-" + slugify(getItemText(item));
  }

  function getAllItems() {
    var all = [];
    filteredData.forEach(function (cat) {
      cat.items.forEach(function (item) {
        all.push({
          id: generateItemId(cat.category, item),
          category: cat.category,
          text: getItemText(item)
        });
      });
    });
    return all;
  }

  function getTotalCount() {
    return getAllItems().length;
  }

  function calculateCategoryCompletion(category, completedItems) {
    var cat = filteredData.find(function (c) { return c.category === category; });
    if (!cat || !cat.items.length) return 0;
    var done = cat.items.filter(function (item) {
      return completedItems[generateItemId(category, item)];
    }).length;
    return Math.round((done / cat.items.length) * 100);
  }

  function calculateOverallCompletion(completedItems) {
    var applicable = getAllItems();
    var total = applicable.length;
    if (!total) return 0;
    var done = applicable.filter(function (entry) {
      return completedItems[entry.id];
    }).length;
    return Math.round((done / total) * 100);
  }

  function getStatusLabel(percent) {
    if (percent === 0) return "Not Started";
    if (percent === 100) return "Complete";
    return "In Progress";
  }

  function getFirstIncompleteItem(completedItems) {
    for (var i = 0; i < filteredData.length; i++) {
      var cat = filteredData[i];
      for (var j = 0; j < cat.items.length; j++) {
        var item = cat.items[j];
        var id = generateItemId(cat.category, item);
        if (!completedItems[id]) {
          return { category: cat.category, text: getItemText(item), id: id };
        }
      }
    }
    return null;
  }

  function getRoleLabel(role) {
    return ROLE_LABELS[normalizeRole(role)] || "MD";
  }

  function getRoleSubtitle(role) {
    return ROLE_SUBTITLES[normalizeRole(role)] || ROLE_SUBTITLES.md;
  }

  global.CHECKLIST = {
    data: filteredData,
    setRole: setRole,
    normalizeRole: normalizeRole,
    getRoleLabel: getRoleLabel,
    getRoleSubtitle: getRoleSubtitle,
    generateItemId: generateItemId,
    getAllItems: getAllItems,
    getTotalCount: getTotalCount,
    calculateCategoryCompletion: calculateCategoryCompletion,
    calculateOverallCompletion: calculateOverallCompletion,
    getStatusLabel: getStatusLabel,
    getFirstIncompleteItem: getFirstIncompleteItem
  };
})(window);
