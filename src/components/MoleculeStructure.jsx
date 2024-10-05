"use client";
import React, { useState, useEffect, useRef } from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import initRDKitModule from "@rdkit/rdkit";

const initRDKit = (() => {
  let rdkitLoadingPromise;
  return () => {
    if (!rdkitLoadingPromise) {
      rdkitLoadingPromise = new Promise((resolve, reject) => {
        initRDKitModule()
          .then((RDKit) => {
            resolve(RDKit);
          })
          .catch((e) => {
            reject(e);
          });
      });
    }
    return rdkitLoadingPromise;
  };
})();

const MoleculeStructure = (props) => {
  const {
    id,
    className,
    svgMode,
    width,
    height,
    structure,
    subStructure,
    extraDetails,
    drawingDelay,
    scores,
  } = props;

  const MOL_DETAILS = {
    width,
    height,
    bondLineWidth: 1,
    addStereoAnnotation: true,
    ...extraDetails,
  };

  const [svg, setSvg] = useState(undefined);
  const [rdKitLoaded, setRdKitLoaded] = useState(false);
  const [rdKitError, setRdKitError] = useState(false);
  const canvasRef = useRef(null);
  const RDKitRef = useRef(null);

  const draw = () => {
    if (drawingDelay) {
      setTimeout(() => {
        drawSVGorCanvas();
      }, drawingDelay);
    } else {
      drawSVGorCanvas();
    }
  };

  const drawSVGorCanvas = () => {
    const mol = RDKitRef.current.get_mol(structure || "invalid");
    const qmol = RDKitRef.current.get_qmol(subStructure || "invalid");
    const isValidMol = !!mol;

    if (svgMode && isValidMol) {
      const svg = mol.get_svg_with_highlights(getMolDetails(mol, qmol));
      setSvg(svg);
    } else if (isValidMol) {
      const canvas = canvasRef.current;
      mol.draw_to_canvas_with_highlights(canvas, getMolDetails(mol, qmol));
    }

    mol?.delete();
    qmol?.delete();
  };

  const getMolDetails = (mol, qmol) => {
    if (mol && qmol) {
      const subStructHighlightDetails = JSON.parse(
        mol.get_substruct_matches(qmol)
      );
      const subStructHighlightDetailsMerged = !_.isEmpty(
        subStructHighlightDetails
      )
        ? subStructHighlightDetails.reduce(
            (acc, { atoms, bonds }) => ({
              atoms: [...acc.atoms, ...atoms],
              bonds: [...acc.bonds, ...bonds],
            }),
            { bonds: [], atoms: [] }
          )
        : subStructHighlightDetails;
      return JSON.stringify({
        ...MOL_DETAILS,
        ...extraDetails,
        ...subStructHighlightDetailsMerged,
      });
    } else {
      return JSON.stringify({
        ...MOL_DETAILS,
        ...extraDetails,
      });
    }
  };

  useEffect(() => {
    initRDKit()
      .then((RDKit) => {
        RDKitRef.current = RDKit;
        setRdKitLoaded(true);
        try {
          draw();
        } catch (err) {
          console.log(err);
        }
      })
      .catch((err) => {
        console.log(err);
        setRdKitError(true);
      });
  }, []);

  useEffect(() => {
    if (rdKitLoaded) {
      draw();
    }
  }, [structure, svgMode, subStructure, width, height, extraDetails]);

  if (rdKitError) {
    return "Error loading renderer.";
  }
  if (!rdKitLoaded) {
    return "Loading renderer...";
  }

  const mol = RDKitRef.current.get_mol(structure || "invalid");
  const isValidMol = !!mol;
  mol?.delete();

  if (!isValidMol) {
    return (
      <span title={`Cannot render structure: ${structure}`}>
        Render Error.
      </span>
    );
  } else if (svgMode) {
    return (
      <div
        title={structure}
        className={"molecule-structure-svg " + (className || "")}
        style={{ width, height }}
        dangerouslySetInnerHTML={{ __html: svg }}
      ></div>
    );
  } else {
    return (
      <div className={"molecule-canvas-container " + (className || "")}>
        <canvas
          title={structure}
          ref={canvasRef}
          id={id}
          width={width}
          height={height}
        ></canvas>
        {scores ? (
          <p className="text-red-600 z-50 p-10">
            Score: {scores.toFixed(2)}
          </p>
        ) : (
          ""
        )}
      </div>
    );
  }
};

MoleculeStructure.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  svgMode: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.number,
  structure: PropTypes.string.isRequired,
  subStructure: PropTypes.string,
  extraDetails: PropTypes.object,
  drawingDelay: PropTypes.number,
  scores: PropTypes.number,
};

MoleculeStructure.defaultProps = {
  subStructure: "",
  className: "",
  width: 250,
  height: 200,
  svgMode: false,
  extraDetails: {},
  drawingDelay: undefined,
  scores: 0,
};

export default MoleculeStructure;