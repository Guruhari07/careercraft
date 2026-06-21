package careercraft_backend.util;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.File;
import java.io.IOException;

public class PdfUtil {

    public static String extractText(File file) {

        try (PDDocument document = Loader.loadPDF(file)) {

            PDFTextStripper stripper =
                    new PDFTextStripper();

            return stripper.getText(document);

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to extract text from PDF",
                    e
            );
        }
    }
}