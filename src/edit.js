import { useBlockProps, RichText } from "@wordpress/block-editor";

import {
  Button,
  PanelBody,
  TextareaControl,
  Spinner,
  TextControl,
  SelectControl,
} from "@wordpress/components";

import apiFetch from "@wordpress/api-fetch";

import { useState } from "@wordpress/element";

export default function Edit({ attributes, setAttributes }) {
  const [docUrl, setDocUrl] = useState("");

  const { title, intro, sections, layout } = attributes;

  const [loading, setLoading] = useState(false);

  const importGoogleDoc = () => {
    setLoading(true);

    apiFetch({
      path: "/documentation-builder/v1/import",

      method: "POST",

      data: {
        url: docUrl,
      },
    })
      .then((response) => {
        setAttributes({
          title: response.title,

          intro: response.intro,

          sections: response.sections,
        });
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  };



  if (loading) {
    return (
      <div {...useBlockProps()}>
        <Spinner />
        <p>Importing DOCX...</p>
      </div>
    );
  }

  if (!sections.length) {
    return (
      <div {...useBlockProps()}>
        <h2>📄 Documentation Builder</h2>

        <p>Paste your Google Docs URL.</p>

        <TextControl
          label="Google Docs URL"
          value={docUrl}
          onChange={setDocUrl}
          placeholder="https://docs.google.com/document/d/..."
        />

        <Button
          variant="primary"
          onClick={() => importGoogleDoc()}
          disabled={!docUrl}
        >
          Import
        </Button>
      </div>
    );
  }



  const updateIntro = (index, value) => {
    const copy = [...intro];

    copy[index].text = value;

    setAttributes({
      intro: copy,
    });
  };

  const updateSectionTitle = (index, value) => {
    const copy = [...sections];

    copy[index].title = value;

    setAttributes({
      sections: copy,
    });
  };

  const updateParagraph = (sectionIndex, blockIndex, value) => {
    const copy = [...sections];

    copy[sectionIndex].blocks[blockIndex].text = value;

    setAttributes({
      sections: copy,
    });
  };

  const updateListItem = (sectionIndex, blockIndex, itemIndex, value) => {
    const copy = [...sections];

    copy[sectionIndex].blocks[blockIndex].items[itemIndex].text = value;

    setAttributes({
      sections: copy,
    });
  };

  return (
    <div {...useBlockProps()}>
      <h2>Documentation Builder</h2>

      <PanelBody title={title || "Title & Introduction"} initialOpen={false}>
        <SelectControl
          label="Layout Type"
          value={layout}
          onChange={(value) =>
            setAttributes({
              layout: value,
            })
          }
          options={[
            { label: "Accordion (Collapsible)", value: "accordion" },
            { label: "Tabs", value: "tabs" },
            { label: "Grid", value: "grid" },
            { label: "Simple List", value: "simple" },
          ]}
        />

        <RichText
          tagName="h3"
          value={title}
          placeholder="Title..."
          onChange={(value) =>
            setAttributes({
              title: value,
            })
          }
        />

        <h4>Introduction</h4>

        {intro.map((block, index) => (
          <TextareaControl
            key={index}
            value={block.text}
            onChange={(value) => updateIntro(index, value)}
          />
        ))}
      </PanelBody>

      <hr />

      {sections.map((section, sectionIndex) => (
        <PanelBody key={sectionIndex} title={section.title} initialOpen={false}>
          <RichText
            tagName="h3"
            value={section.title}
            onChange={(value) => updateSectionTitle(sectionIndex, value)}
          />

          {section.blocks.map((block, blockIndex) => {
            if (block.type === "paragraph") {
              return (
                <TextareaControl
                  key={blockIndex}
                  label="Paragraph"
                  value={block.text}
                  onChange={(value) =>
                    updateParagraph(sectionIndex, blockIndex, value)
                  }
                />
              );
            }

            if (block.type === "list") {
              return (
                <div key={blockIndex}>
                  <h4>Steps</h4>

                  {block.items.map((item, itemIndex) => (
                    <div key={itemIndex} style={{ marginBottom: "20px" }}>
                      <TextareaControl
                        label={`Step ${itemIndex + 1}`}
                        value={item.text}
                        onChange={(value) =>
                          updateListItem(
                            sectionIndex,
                            blockIndex,
                            itemIndex,
                            value,
                          )
                        }
                      />

                      {item.image && (
                        <img
                          src={item.image}
                          style={{
                            maxWidth: "250px",
                            marginTop: "10px",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              );
            }

            return null;
          })}
        </PanelBody>
      ))}
    </div>
  );
}
