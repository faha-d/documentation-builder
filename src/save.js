import { useBlockProps, RichText } from "@wordpress/block-editor";

export default function Save({ attributes }) {
  const { title, intro, sections } = attributes;

  return (
    <div {...useBlockProps.save()} className="db-documentation">
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
              {section.blocks.map((block, blockIndex) => {
                if (block.type === "paragraph") {
                  return <p key={blockIndex}>{block.text}</p>;
                }

                if (block.type === "list") {
                  return (
                    <ul key={blockIndex}>
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
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
