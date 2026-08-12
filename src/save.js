import { useBlockProps, RichText } from "@wordpress/block-editor";

const renderBlockContent = (block) => {
  if (block.type === "paragraph") {
    return <p key={`block-${block.text}`}>{block.text}</p>;
  }

  if (block.type === "list") {
    return (
      <ul key={`block-list`}>
        {block.items.map((item, i) => (
          <li key={i}>
            {item.text}
            {item.image && (
              <div className="db-step-image">
                <img src={item.image} alt="" />
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return null;
};

const renderAccordion = (title, intro, sections) => (
  <div className="db-accordion">
    <div className="db-item">
      <button className="db-title" type="button">
        {title || "Introduction"}
        <span className="db-icon">+</span>
      </button>
      <div className="db-content">
        {intro.map((block, index) => (
          <p key={index}>{block.text}</p>
        ))}
      </div>
    </div>
    {sections.map((section, index) => (
      <div className="db-item" key={index}>
        <button className="db-title" type="button">
          {section.title}
          <span className="db-icon">+</span>
        </button>
        <div className="db-content">
          {section.blocks.map((block, blockIndex) =>
            renderBlockContent({ ...block, blockIndex })
          )}
        </div>
      </div>
    ))}
  </div>
);

const renderTabs = (title, intro, sections) => (
  <div className="db-tabs">
    <div className="db-tabs-nav">
      <button className="db-tab-button active" data-tab="intro">
        {title || "Introduction"}
      </button>
      {sections.map((section, index) => (
        <button key={index} className="db-tab-button" data-tab={`section-${index}`}>
          {section.title}
        </button>
      ))}
    </div>
    <div className="db-tabs-content">
      <div className="db-tab-pane active" data-pane="intro">
        {intro.map((block, index) => (
          <p key={index}>{block.text}</p>
        ))}
      </div>
      {sections.map((section, index) => (
        <div key={index} className="db-tab-pane" data-pane={`section-${index}`}>
          {section.blocks.map((block, blockIndex) =>
            renderBlockContent({ ...block, blockIndex })
          )}
        </div>
      ))}
    </div>
  </div>
);

const renderGrid = (title, intro, sections) => (
  <div className="db-grid">
    <div className="db-grid-section db-intro-section">
      <h3>{title || "Introduction"}</h3>
      <div className="db-grid-content">
        {intro.map((block, index) => (
          <p key={index}>{block.text}</p>
        ))}
      </div>
    </div>
    {sections.map((section, index) => (
      <div key={index} className="db-grid-section">
        <h3>{section.title}</h3>
        <div className="db-grid-content">
          {section.blocks.map((block, blockIndex) =>
            renderBlockContent({ ...block, blockIndex })
          )}
        </div>
      </div>
    ))}
  </div>
);

const renderSimple = (title, intro, sections) => (
  <div className="db-simple">
    <div className="db-section">
      <h2>{title || "Introduction"}</h2>
      {intro.map((block, index) => (
        <p key={index}>{block.text}</p>
      ))}
    </div>
    {sections.map((section, index) => (
      <div key={index} className="db-section">
        <h2>{section.title}</h2>
        {section.blocks.map((block, blockIndex) =>
          renderBlockContent({ ...block, blockIndex })
        )}
      </div>
    ))}
  </div>
);

export default function Save({ attributes }) {
  const { title, intro, sections, layout = "accordion" } = attributes;

  let content;
  switch (layout) {
    case "tabs":
      content = renderTabs(title, intro, sections);
      break;
    case "grid":
      content = renderGrid(title, intro, sections);
      break;
    case "simple":
      content = renderSimple(title, intro, sections);
      break;
    default:
      content = renderAccordion(title, intro, sections);
  }

  return (
    <div {...useBlockProps.save()} className="db-documentation">
      {content}
    </div>
  );
}
